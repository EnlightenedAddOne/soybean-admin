import { computed, effectScope, onScopeDispose, reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { PaginationProps } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { useBoolean, useHookTable } from '@sa/hooks';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

type TableData = NaiveUI.TableData;
type GetTableData<A extends NaiveUI.TableApiFn> = NaiveUI.GetTableData<A>;
type TableColumn<T> = NaiveUI.TableColumn<T>;

/**
 * 表格数据管理Hook
 *
 * @param config 表格配置
 * @returns 表格状态和方法
 */
export function useTable<A extends NaiveUI.TableApiFn>(config: NaiveUI.NaiveTableConfig<A>) {
  const scope = effectScope();
  const appStore = useAppStore();
  const isMobile = computed(() => appStore.isMobile); // 判断是否为移动端

  const { apiFn, apiParams, immediate, showTotal } = config;

  const SELECTION_KEY = '__selection__'; // 选择列的键
  const EXPAND_KEY = '__expand__'; // 展开列的键

  const {
    loading,
    empty,
    data,
    columns,
    columnChecks,
    reloadColumns,
    getData,
    searchParams,
    updateSearchParams,
    resetSearchParams
  } = useHookTable<A, GetTableData<A>, TableColumn<NaiveUI.TableDataWithIndex<GetTableData<A>>>>({
    apiFn,
    apiParams,
    columns: config.columns,
    transformer: res => {
      const { records = [], current = 1, size = 10, total = 0 } = res.data || {};

      // 确保分页大小大于0，否则会导致分页计算错误
      const pageSize = size <= 0 ? 10 : size;

      const recordsWithIndex = records.map((item, index) => {
        return {
          ...item,
          index: (current - 1) * pageSize + index + 1
        };
      });

      return {
        data: recordsWithIndex,
        pageNum: current,
        pageSize,
        total
      };
    },
    getColumnChecks: cols => {
      const checks: NaiveUI.TableColumnCheck[] = [];

      cols.forEach(column => {
        if (isTableColumnHasKey(column)) {
          checks.push({
            key: column.key as string,
            title: column.title as string,
            checked: true
          });
        } else if (column.type === 'selection') {
          checks.push({
            key: SELECTION_KEY,
            title: $t('common.check'),
            checked: true
          });
        } else if (column.type === 'expand') {
          checks.push({
            key: EXPAND_KEY,
            title: $t('common.expandColumn'),
            checked: true
          });
        }
      });

      return checks;
    },
    getColumns: (cols, checks) => {
      const columnMap = new Map<string, TableColumn<GetTableData<A>>>();

      cols.forEach(column => {
        if (isTableColumnHasKey(column)) {
          columnMap.set(column.key as string, column);
        } else if (column.type === 'selection') {
          columnMap.set(SELECTION_KEY, column);
        } else if (column.type === 'expand') {
          columnMap.set(EXPAND_KEY, column);
        }
      });

      const filteredColumns = checks
        .filter(item => item.checked)
        .map(check => columnMap.get(check.key) as TableColumn<GetTableData<A>>);

      return filteredColumns;
    },
    onFetched: async transformed => {
      const { pageNum, pageSize, total } = transformed;

      updatePagination({
        page: pageNum,
        pageSize,
        itemCount: total
      });
    },
    immediate
  });

  /* 分页配置 */
  const pagination: PaginationProps = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    itemCount: 0,
    pageSizes: [10, 15, 20, 25, 30],
    onUpdatePage: async (page: number) => {
      pagination.page = page;

      updateSearchParams({
        current: page,
        size: pagination.pageSize!
      });

      getData();
    },
    onUpdatePageSize: async (pageSize: number) => {
      pagination.pageSize = pageSize;
      pagination.page = 1;

      updateSearchParams({
        current: pagination.page,
        size: pageSize
      });

      getData();
    },
    ...(showTotal
      ? {
          prefix: page => $t('datatable.itemCount', { total: page.itemCount })
        }
      : {})
  });

  /* 移动端分页适配 */
  const mobilePagination = computed(() => ({
    ...pagination,
    pageSlot: isMobile.value ? 3 : 9, // 移动端显示较少页码
    prefix: !isMobile.value && showTotal ? pagination.prefix : undefined
  }));

  function updatePagination(update: Partial<PaginationProps>) {
    Object.assign(pagination, update);
  }

  /**
   * 根据页码获取数据
   *
   * @param pageNum 页码，默认为1
   */
  async function getDataByPage(pageNum: number = 1) {
    updatePagination({
      page: pageNum
    });

    updateSearchParams({
      current: pageNum,
      size: pagination.pageSize!
    });

    await getData();
  }

  scope.run(() => {
    watch(
      () => appStore.locale,
      () => {
        reloadColumns();
      }
    );
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    loading,
    empty,
    data,
    columns,
    columnChecks,
    reloadColumns,
    pagination,
    mobilePagination,
    updatePagination,
    getData,
    getDataByPage,
    searchParams,
    updateSearchParams,
    resetSearchParams
  };
}

/**
 * 表格操作Hook
 *
 * @param data 表格数据引用
 * @param getData 数据获取方法
 * @returns 表格操作相关状态和方法
 */
export function useTableOperate<T extends TableData = TableData>(data: Ref<T[]>, getData: () => Promise<void>) {
  const { bool: drawerVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBoolean();

  const operateType = ref<NaiveUI.TableOperateType>('add');

  function handleAdd() {
    operateType.value = 'add';
    openDrawer();
  }

  /** 编辑行数据 */
  const editingData: Ref<T | null> = ref(null);

  function handleEdit(id: T['id']) {
    operateType.value = 'edit';
    const findItem = data.value.find(item => item.id === id) || null;
    editingData.value = jsonClone(findItem);

    openDrawer();
  }

  /** 表格中选中的行键 */
  const checkedRowKeys = ref<string[]>([]);

  /** 批量删除操作完成后的钩子 */
  async function onBatchDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    checkedRowKeys.value = [];

    await getData();
  }

  /** 删除操作完成后的钩子 */
  async function onDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    await getData();
  }

  return {
    drawerVisible,
    openDrawer,
    closeDrawer,
    operateType,
    handleAdd,
    editingData,
    handleEdit,
    checkedRowKeys,
    onBatchDeleted,
    onDeleted
  };
}

function isTableColumnHasKey<T>(column: TableColumn<T>): column is NaiveUI.TableColumnWithKey<T> {
  return Boolean((column as NaiveUI.TableColumnWithKey<T>).key);
}

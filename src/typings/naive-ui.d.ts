declare namespace NaiveUI {
  type ThemeColor = 'default' | 'error' | 'primary' | 'info' | 'success' | 'warning';
  type Align = 'stretch' | 'baseline' | 'start' | 'end' | 'center' | 'flex-end' | 'flex-start';

  type DataTableBaseColumn<T> = import('naive-ui').DataTableBaseColumn<T>;
  type DataTableExpandColumn<T> = import('naive-ui').DataTableExpandColumn<T>;
  type DataTableSelectionColumn<T> = import('naive-ui').DataTableSelectionColumn<T>;
  type TableColumnGroup<T> = import('naive-ui/es/data-table/src/interface').TableColumnGroup<T>;
  type PaginationProps = import('naive-ui').PaginationProps;
  type TableColumnCheck = import('@sa/hooks').TableColumnCheck;
  type TableDataWithIndex<T> = import('@sa/hooks').TableDataWithIndex<T>;
  type FlatResponseData<T> = import('@sa/axios').FlatResponseData<T>;

  /**
   * 自定义列键
   *
   * 如果你想添加自定义列，你应该在这个类型中添加一个键
   */
  type CustomColumnKey = 'operate';

  type SetTableColumnKey<C, T> = Omit<C, 'key'> & { key: keyof T | CustomColumnKey };

  type TableData = Api.Common.CommonRecord<object>;

  type TableColumnWithKey<T> = SetTableColumnKey<DataTableBaseColumn<T>, T> | SetTableColumnKey<TableColumnGroup<T>, T>;

  type TableColumn<T> = TableColumnWithKey<T> | DataTableSelectionColumn<T> | DataTableExpandColumn<T>;

  type TableApiFn<T = any, R = Api.Common.CommonSearchParams> = (
    params: R
  ) => Promise<FlatResponseData<Api.Common.PaginatingQueryRecord<T>>>;

  /**
   * 表格操作类型
   *
   * - add: 添加表格项
   * - edit: 编辑表格项
   */
  type TableOperateType = 'add' | 'edit';

  type GetTableData<A extends TableApiFn> = A extends TableApiFn<infer T> ? T : never;

  type NaiveTableConfig<A extends TableApiFn> = Pick<
    import('@sa/hooks').TableConfig<A, GetTableData<A>, TableColumn<TableDataWithIndex<GetTableData<A>>>>,
    'apiFn' | 'apiParams' | 'columns' | 'immediate'
  > & {
    /**
     * 是否显示总条目数
     *
     * @default false
     */
    showTotal?: boolean;
  };
}

/**
 * Api 命名空间
 *
 * 所有后端API类型
 */
declare namespace Api {
  namespace Common {
    /** 分页通用参数 */
    interface PaginatingCommonParams {
      /** 当前页码 */
      current: number;
      /** 每页大小 */
      size: number;
      /** 总数量 */
      total: number;
    }

    /** 分页查询列表数据的通用参数 */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /** 表格通用搜索参数 */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * 启用状态
     *
     * - "1": 启用
     * - "2": 禁用
     */
    type EnableStatus = '1' | '2';

    /** 通用记录 */
    type CommonRecord<T = any> = {
      /** 记录ID */
      id: number;
      /** 记录创建者 */
      createBy: string;
      /** 记录创建时间 */
      createTime: string;
      /** 记录更新者 */
      updateBy: string;
      /** 记录更新时间 */
      updateTime: string;
      /** 记录状态 */
      status: EnableStatus | null;
    } & T;
  }

  /**
   * 认证命名空间
   *
   * 后端API模块: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }

  /**
   * 路由命名空间
   *
   * 后端API模块: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  /**
   * 系统管理命名空间
   *
   * 后端API模块: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** 角色 */
    type Role = Common.CommonRecord<{
      /** 角色名称 */
      roleName: string;
      /** 角色代码 */
      roleCode: string;
      /** 角色描述 */
      roleDesc: string;
    }>;

    /** 角色搜索参数 */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    /** 角色列表 */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** 所有角色 */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /**
     * 用户性别
     *
     * - "1": "男"
     * - "2": "女"
     */
    type UserGender = '1' | '2';

    /** 用户 */
    type User = Common.CommonRecord<{
      /** 用户名 */
      userName: string;
      /** 用户性别 */
      userGender: UserGender | null;
      /** 用户昵称 */
      nickName: string;
      /** 用户电话 */
      userPhone: string;
      /** 用户邮箱 */
      userEmail: string;
      /** 用户角色代码集合 */
      userRoles: string[];
    }>;

    /** 用户搜索参数 */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'> &
        CommonSearchParams
    >;

    /** 用户列表 */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * 菜单类型
     *
     * - "1": 目录
     * - "2": 菜单
     */
    type MenuType = '1' | '2';

    type MenuButton = {
      /**
       * 按钮代码
       *
       * 可用于控制按钮权限
       */
      code: string;
      /** 按钮描述 */
      desc: string;
    };

    /**
     * 图标类型
     *
     * - "1": Iconify图标
     * - "2": 本地图标
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      /** 父菜单ID */
      parentId: number;
      /** 菜单类型 */
      menuType: MenuType;
      /** 菜单名称 */
      menuName: string;
      /** 路由名称 */
      routeName: string;
      /** 路由路径 */
      routePath: string;
      /** 组件 */
      component?: string;
      /** Iconify图标名称或本地图标名称 */
      icon: string;
      /** 图标类型 */
      iconType: IconType;
      /** 按钮 */
      buttons?: MenuButton[] | null;
      /** 子菜单 */
      children?: Menu[] | null;
    }> &
      MenuPropsOfRoute;

    /** 菜单列表 */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };
  }
}

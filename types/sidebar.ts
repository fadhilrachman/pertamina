export interface IChildSidebar {
  label: string;
  id: string;
  route: string;
  icon?: any;
  active?: boolean;
  hiddenForRoles?: string[];
}

export interface ISidebar {
  id: string;
  label: string;
  route?: string;
  startWith?: string;
  icon?: any;
  active?: boolean;
  isOpen?: boolean;
  menu?: IChildSidebar[];
  visibleForRole?: "administrator" | "non-administrator";
  hiddenForRoles?: string[];
}

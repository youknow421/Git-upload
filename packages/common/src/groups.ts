export type GroupMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: GroupMember[];
  sharedCart: string[];
};

export type GroupState = {
  groups: Group[];
  activeGroupId: string | null;
};

export type GroupAction =
  | { type: 'CREATE_GROUP'; payload: { name: string; description: string } }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'SET_ACTIVE_GROUP'; payload: string | null }
  | { type: 'ADD_MEMBER'; payload: { groupId: string; member: Omit<GroupMember, 'joinedAt'> } }
  | { type: 'REMOVE_MEMBER'; payload: { groupId: string; memberId: string } }
  | { type: 'UPDATE_MEMBER_ROLE'; payload: { groupId: string; memberId: string; role: GroupMember['role'] } }
  | { type: 'UPDATE_GROUP'; payload: { groupId: string; name?: string; description?: string } }
  | { type: 'ADD_TO_SHARED_CART'; payload: { groupId: string; itemId: string } }
  | { type: 'REMOVE_FROM_SHARED_CART'; payload: { groupId: string; itemId: string } }
  | { type: 'SET_GROUPS'; payload: Group[] };

export const initialGroupState: GroupState = {
  groups: [],
  activeGroupId: null,
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const groupReducer = (state: GroupState, action: GroupAction): GroupState => {
  switch (action.type) {
    case 'CREATE_GROUP': {
      const newGroup: Group = {
        id: generateId(),
        name: action.payload.name,
        description: action.payload.description,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: 'current-user',
            name: 'You',
            email: 'user@example.com',
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
        ],
        sharedCart: [],
      };
      return {
        ...state,
        groups: [...state.groups, newGroup],
      };
    }
    case 'DELETE_GROUP': {
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
        activeGroupId: state.activeGroupId === action.payload ? null : state.activeGroupId,
      };
    }
    case 'SET_ACTIVE_GROUP': {
      return {
        ...state,
        activeGroupId: action.payload,
      };
    }
    case 'ADD_MEMBER': {
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.groupId) {
            return {
              ...group,
              members: [
                ...group.members,
                {
                  ...action.payload.member,
                  joinedAt: new Date().toISOString(),
                },
              ],
            };
          }
          return group;
        }),
      };
    }
    case 'REMOVE_MEMBER': {
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.groupId) {
            return {
              ...group,
              members: group.members.filter((m) => m.id !== action.payload.memberId),
            };
          }
          return group;
        }),
      };
    }
    case 'UPDATE_MEMBER_ROLE': {
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.groupId) {
            return {
              ...group,
              members: group.members.map((m) =>
                m.id === action.payload.memberId ? { ...m, role: action.payload.role } : m
              ),
            };
          }
          return group;
        }),
      };
    }
    case 'UPDATE_GROUP': {
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.groupId) {
            return {
              ...group,
              ...(action.payload.name && { name: action.payload.name }),
              ...(action.payload.description && { description: action.payload.description }),
            };
          }
          return group;
        }),
      };
    }
    case 'ADD_TO_SHARED_CART': {
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.groupId) {
            return {
              ...group,
              sharedCart: [...group.sharedCart, action.payload.itemId],
            };
          }
          return group;
        }),
      };
    }
    case 'REMOVE_FROM_SHARED_CART': {
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.groupId) {
            return {
              ...group,
              sharedCart: group.sharedCart.filter((id) => id !== action.payload.itemId),
            };
          }
          return group;
        }),
      };
    }
    case 'SET_GROUPS': {
      return {
        ...state,
        groups: action.payload,
      };
    }
    default:
      return state;
  }
};

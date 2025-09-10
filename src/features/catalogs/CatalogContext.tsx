import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CatalogType, CatalogItem, CatalogItemForm } from './types';

interface CatalogState {
  items: Record<CatalogType, CatalogItem[]>;
  loading: boolean;
  error: string | null;
  activeCatalog: CatalogType;
}

type CatalogAction =
  | { type: 'SET_ACTIVE_CATALOG'; payload: CatalogType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: { type: CatalogType; items: CatalogItem[] } }
  | { type: 'ADD_ITEM'; payload: { type: CatalogType; item: CatalogItem } }
  | { type: 'UPDATE_ITEM'; payload: { type: CatalogType; item: CatalogItem } }
  | { type: 'DELETE_ITEM'; payload: { type: CatalogType; itemId: string } }
  | { type: 'TOGGLE_ITEM_STATUS'; payload: { type: CatalogType; itemId: string } };

const initialState: CatalogState = {
  items: Object.values(CatalogType).reduce((acc, type) => ({
    ...acc,
    [type]: []
  }), {} as Record<CatalogType, CatalogItem[]>),
  loading: false,
  error: null,
  activeCatalog: CatalogType.TECHNOLOGIES
};

function catalogReducer(state: CatalogState, action: CatalogAction): CatalogState {
  switch (action.type) {
    case 'SET_ACTIVE_CATALOG':
      return { ...state, activeCatalog: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ITEMS':
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.type]: action.payload.items
        }
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.type]: [...state.items[action.payload.type], action.payload.item]
        }
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.type]: state.items[action.payload.type].map(item =>
            item.id === action.payload.item.id ? action.payload.item : item
          )
        }
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.type]: state.items[action.payload.type].filter(
            item => item.id !== action.payload.itemId
          )
        }
      };
    case 'TOGGLE_ITEM_STATUS':
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.type]: state.items[action.payload.type].map(item =>
            item.id === action.payload.itemId
              ? { ...item, isActive: !item.isActive }
              : item
          )
        }
      };
    default:
      return state;
  }
}

const CatalogContext = createContext<{
  state: CatalogState;
  dispatch: React.Dispatch<CatalogAction>;
} | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  return (
    <CatalogContext.Provider value={{ state, dispatch }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}

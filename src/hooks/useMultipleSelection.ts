
import { useState, useCallback } from "react";

/**
 * Hook personalizado para gerenciar seleção múltipla de itens
 * 
 * @param items Array de itens disponíveis para seleção
 * @param getItemId Função para obter o ID de cada item (padrão: assume que cada item tem uma propriedade 'id')
 * @returns Objeto com estado e funções para gerenciar a seleção múltipla
 */
export const useMultipleSelection = <T>(
  items: T[],
  getItemId: (item: T) => string = (item: any) => item.id
) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  
  /**
   * Seleciona ou deseleciona um item específico
   */
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        // Se o item já estiver selecionado, remova-o
        const newSelection = prev.filter(id => id !== itemId);
        // Se já não estão todos selecionados, desmarque "selecionar todos"
        setSelectAllChecked(false);
        return newSelection;
      } else {
        // Adicione o novo item à seleção
        const newSelection = [...prev, itemId];
        // Verifique se todos os itens estão selecionados agora
        if (newSelection.length === items.length) {
          setSelectAllChecked(true);
        }
        return newSelection;
      }
    });
  }, [items]);
  
  /**
   * Alterna entre selecionar todos os itens ou nenhum
   */
  const toggleSelectAll = useCallback(() => {
    if (selectAllChecked) {
      // Se todos já estiverem selecionados, desmarque todos
      setSelectedItems([]);
    } else {
      // Caso contrário, selecione todos
      setSelectedItems(items.map(getItemId));
    }
    setSelectAllChecked(!selectAllChecked);
  }, [items, selectAllChecked, getItemId]);
  
  /**
   * Limpa todas as seleções
   */
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
    setSelectAllChecked(false);
  }, []);

  return {
    selectedItems,
    selectAllChecked,
    toggleItemSelection,
    toggleSelectAll,
    clearSelection,
    hasSelection: selectedItems.length > 0
  };
};

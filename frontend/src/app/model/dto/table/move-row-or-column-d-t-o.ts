export interface MoveRowOrColumnDTO {
  idsToMove: string[],
  fromIndex: number
  toIndex: number
}


export interface MovedRowsOrColumnsDTO {
  indexes: number[], // indici selezionati spostati o indice spostato
  delta: number // di qunato deve essere spostata una riga o colonna
}

export enum LotteryGameDay {
  LUN = 'LUNES',
  MAR = 'MARTES',
  MIE = 'MIÉRCOLES',
  JUE = 'JUEVES',
  VIE = 'VIERNES',
  SÁB = 'SÁBADO',
  DOM = 'DOMINGO',
  EXTRA = 'ÚLTIMO SABADO DEL MES',
}

export const LOTTERY_GAME_DAYS = Object.values(LotteryGameDay)
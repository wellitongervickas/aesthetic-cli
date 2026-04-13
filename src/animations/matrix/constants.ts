const KATAKANA =
  "ﾊﾐﾋｰｳﾆﾎﾌﾄﾁﾓﾅｦｧｨｩｪｫｬｭｮｯｱｲｴｵｶｷｸｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const NUMERALS = "0123456789";
const SYMBOLS = "Z*:=.$|_";

export const CHARSET = (KATAKANA + NUMERALS + SYMBOLS).split("");

export const TICK_MS = 80;
export const MIN_SPEED = 1;
export const MAX_SPEED = 4;
export const MIN_LENGTH = 6;
export const MAX_LENGTH = 28;
export const SPAWN_CHANCE = 0.06;
export const MUTATION_CHANCE = 0.04;
export const BRIGHTNESS_EXPONENT = 1.8;
export const PRESEED_RATIO = 0.45;
export const MAX_COLS = 80;
export const MAX_ROWS = 24;

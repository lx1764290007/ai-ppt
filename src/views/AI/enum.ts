type Type_Edit = 'BOLD'|'ITALIC'|'UNDERLINE'|'COLOR';

export const PPT_ENUM:Readonly<Record<Type_Edit, string>> = {
  BOLD: 'bold',
  ITALIC: 'ITALIC',
  UNDERLINE: 'UNDERLINE',
  COLOR: 'color'
}

type PPT_ENUM_TYPE = 'T1'|'T2'|'T3';

export const PPT_ENUM_TEMPLATE_TYPE:Readonly<Record<PPT_ENUM_TYPE, number>> = {
  T1: 1,
  T2: 2,
  T3: 3
}
export const EXPORTING:Readonly<'exporting'> = 'exporting';


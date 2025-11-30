import { Markup } from "telegraf"

const BUTTON_PREFIX = "btn_"
export function makeKeyboard(rows: string[][]) {
   return Markup.inlineKeyboard(rows.map(row =>
      row.map(btn_text => Markup.button.callback(btn_text, BUTTON_PREFIX + btn_text))
   ))
}
#include "helpers.h"

static void drawGradientRect(float x, float y, float w, float h, float p, u32 color, int r1, int g1, int b1, int r2, int g2, int b2, int opacity) {
	if (p > 0) C2D_DrawRectangle(x, y, 0, w, h, C2D_Color32(r1, g1, b1, opacity), C2D_Color32((r1*w/(w+h) + r2*h/(w+h)), (g1*w/(w+h) + g2*h/(w+h)), (b1*w/(w+h) + b2*h/(w+h)), opacity), C2D_Color32((r1*h/(w+h) + r2*w/(w+h)), (g1*h/(w+h) + g2*w/(w+h)), (b1*h/(w+h) + b2*w/(w+h)), opacity), C2D_Color32(r2, g2, b2, opacity));
	if (p * 2 < w || p * 2 < h) C2D_DrawRectSolid(x + p, y + p, 0, w - p * 2, h - p * 2, color);
}

static void drawDynamicText(C2D_TextBuf buffer, float x, float y, float scale, u32 color, C2D_Font rfont, u32 flags, const char* text, ...) {
	char buff[160];
	C2D_Text textVar;
	va_list va;
	va_start(va, text);
	vsnprintf(buff, sizeof(buff), text, va);
	va_end(va);
	C2D_TextFontParse(&textVar, rfont, buffer, buff);
	C2D_TextOptimize(&textVar);
	C2D_DrawText(&textVar, flags | C2D_WithColor, x, y, 1.0f, scale, scale, color);
}

int udef = 0;

const u32 pwdef = C2D_Color32(0xFA, 0xB3, 0x87, 0xFF); // platform, wall, decor
const u32 cdef =  C2D_Color32(0xF5, 0xC2, 0xE7, 0xFF); // coins
const u32 pdef =  C2D_Color32(0xCB, 0xA6, 0xF7, 0xFF); // portal
const u32 jdef =  C2D_Color32(0xA6, 0xE3, 0xA1, 0xFF); // jump pad
const u32 bdef =  C2D_Color32(0x6C, 0x70, 0x86, 0xFF); // border

obstacle lamp[6] = {
	{60 , 6, 10 , 164 , 5   , 5, udef, udef, pwdef}, //pole
	{50 , 0, 30 , 6   , 3   , 5, udef, udef, pwdef}, //bulb
	{50 , 6, 50 , 170 , udef, 6, 0   , 170 , C2D_Color32(0xFF, 0xF9, 0xD8, 0x50)}, //out-left
	{80 , 6, 80 , 170 , udef, 6, 130 , 170 , C2D_Color32(0xFF, 0xF9, 0xD8, 0x50)}, //out-right
	{50 , 6, 50 , 170 , udef, 6, 80  , 6   , C2D_Color32(0xFF, 0xF9, 0xD8, 0x50)}, //inner-left
	{80 , 6, 80 , 170 , udef, 6, 50  , 170 , C2D_Color32(0xFF, 0xF9, 0xD8, 0x50)}  //inner-right
};

static obstacle transLamp(int x, int y, int i) {
	if (i == 0 || i == 1) {
		return {lamp[i].x + x, lamp[i].y + y, lamp[i].w    , lamp[i].h, lamp[i].bord    , lamp[i].type, lamp[i].d1    , lamp[i].d2    , lamp[i].col};
	} else {
		return {lamp[i].x + x, lamp[i].y + y, lamp[i].w + x, lamp[i].h + y, lamp[i].bord, lamp[i].type, lamp[i].d1 + x, lamp[i].d2 + y, lamp[i].col};
	}
}
#include "structs.h"

static void drawGradientRect(float x, float y, float w, float h, float p, u32 color, int r1, int g1, int b1, int r2, int g2, int b2, int opacity);
static void drawDynamicText(C2D_TextBuf buffer, float x, float y, float scale, u32 color, C2D_Font rfont, u32 flags, const char* text, ...);

//     const typ      def

extern       int      udef;

extern const u32      pwdef;
extern const u32      cdef;
extern const u32      pdef;
extern const u32      jdef;
extern const u32      bdef;

extern       obstacle lamp[6];

static obstacle transLamp(int x, int y, int i);
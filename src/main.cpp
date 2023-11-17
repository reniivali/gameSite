#include <3ds.h>
#include <citro2d.h>

#include <string.h>
#include <stdio.h>
#include <stdlib.h>

#define S_WIDTH 400
#define S_HEIGHT 240

const float PI = atan(1) * 4;

int frame = 0;

struct moving {
	bool l, r;
};

struct player {
	float x, y;
	int w, h;
	float xVel, yVel;
	float xCap;
	float friction;
	float jumpHeight;
	float movSpeed;
	float airFactor;
	int coins;
	moving mov;
	bool grounded;
};

player ply = {
	/*X, Y*/      20, 20,
	/*W, H*/      20, 40,
	/*xVel, yVel*/0, 0,
	/*xCap*/      10.0f,
	/*friction*/  0.9f,
	/*jumpHeight*/15.0f,
	/*movSpeed*/  2.5f,
	/*airFactor*/ 0.5f,
	/*coins*/     0,
	/*mov L, R*/  {false, false},
	/*grounded*/  false
};

struct predict {
	float x, y;
	float vx, vy;
};

struct predictions {
	predict pr[10];
};

struct crosshair {
	float x, y;
};

struct coord {
	float x, y;
};

struct rotRect {
	coord tl, tr, bl, br;
};

crosshair cross = { S_WIDTH / 2, S_HEIGHT / 2 };

void renderCrosshair() {
	C2D_DrawRectSolid(cross.x - 10, cross.y - 2, 0, 20, 4, C2D_Color32(0x50, 0x50, 0x50, 0xFF));
	C2D_DrawRectSolid(cross.x - 2, cross.y - 10, 0, 4, 20, C2D_Color32(0x50, 0x50, 0x50, 0xFF));
}

bool paused = false;
bool showPaths = false;
float gravity = 0.5f;

static void drawGradientRect(float x, float y, float w, float h, float p, u32 color, int r1, int g1, int b1, int r2, int g2, int b2, int opacity) {
	C2D_DrawRectangle(x, y, 0, w, h, C2D_Color32(r1, g1, b1, opacity), C2D_Color32((r1*w/(w+h) + r2*h/(w+h)), (g1*w/(w+h) + g2*h/(w+h)), (b1*w/(w+h) + b2*h/(w+h)), opacity), C2D_Color32((r1*h/(w+h) + r2*w/(w+h)), (g1*h/(w+h) + g2*w/(w+h)), (b1*h/(w+h) + b2*w/(w+h)), opacity), C2D_Color32(r2, g2, b2, opacity));
	C2D_DrawRectSolid(x + p, y + p, 0, w - p * 2, h - p * 2, color);
}

static float degToRad(float r) {
	float rad = r * PI / 180;
	return rad;
}

static rotRect drawRotatedRect(float x, float y, float w, float h, float r, float p, u32 color, int r1, int g1, int b1, int r2, int g2, int b2, int opacity, bool calc) {
	float lx = x + w / 2;
	float ly = y + h / 2;
	coord corn[8] = {
		// Outer
		// Top Left
		{lx - ((w/2) * cos(r)) - ((h/2) * sin(r)),
		 ly - ((w/2) * sin(r)) + ((h/2) * cos(r))},
		// Top Right
		{lx + ((w/2) * cos(r)) - ((h/2) * sin(r)),
		 ly + ((w/2) * sin(r)) + ((h/2) * cos(r))},
		// Bottom Right
		{lx + ((w/2) * cos(r)) + ((h/2) * sin(r)),
		 ly + ((w/2) * sin(r)) - ((h/2) * cos(r))},
		// Bottom Left
		{lx - ((w/2) * cos(r)) + ((h/2) * sin(r)),
		 ly - ((w/2) * sin(r)) - ((h/2) * cos(r))},
		// Inner
		// Top Left
		{lx - ((w/2 - p) * cos(r)) - ((h/2 - p) * sin(r)),
		 ly - ((w/2 - p) * sin(r)) + ((h/2 - p) * cos(r))},
		// Top Right
		{lx + ((w/2 - p) * cos(r)) - ((h/2 - p) * sin(r)),
		 ly + ((w/2 - p) * sin(r)) + ((h/2 - p) * cos(r))},
		// Bottom Right
		{lx + ((w/2 - p) * cos(r)) + ((h/2 - p) * sin(r)),
		 ly + ((w/2 - p) * sin(r)) - ((h/2 - p) * cos(r))},
		// Bottom Left
		{lx - ((w/2 - p) * cos(r)) + ((h/2 - p) * sin(r)),
		 ly - ((w/2 - p) * sin(r)) - ((h/2 - p) * cos(r))}
	};
	if (!calc){
		//right triangle
		C2D_DrawTriangle(
			corn[0].x, corn[0].y, C2D_Color32(r1, g1, b1, opacity),
			corn[1].x, corn[1].y, C2D_Color32(
				(r1 * w / (w + h) + r2 * h / (w + h)),
				(g1 * w / (w + h) + g2 * h / (w + h)),
				(b1 * w / (w + h) + b2 * h / (w + h)),
				opacity),
			corn[2].x, corn[2].y, C2D_Color32(r2, g2, b2, opacity), 0
		);
		//left triangle
		C2D_DrawTriangle(
			corn[0].x, corn[0].y, C2D_Color32(r1, g1, b1, opacity),
			corn[3].x, corn[3].y, C2D_Color32(
				(r1 * h / (w + h) + r2 * w / (w + h)),
				(g1 * h / (w + h) + g2 * w / (w + h)),
				(b1 * h / (w + h) + b2 * w / (w + h)),
				opacity),
			corn[2].x, corn[2].y, C2D_Color32(r2, g2, b2, opacity), 0
		);

		//right inner triangle
		C2D_DrawTriangle(
			corn[4].x, corn[4].y, color,
			corn[5].x, corn[5].y, color,
			corn[6].x, corn[6].y, color, 0
		);
		//left inner triangle
		C2D_DrawTriangle(
			corn[4].x, corn[4].y, color,
			corn[7].x, corn[7].y, color,
			corn[6].x, corn[6].y, color, 0
		);
		return {0,0,0,0,0,0,0,0};
	} else {
		return {
			corn[0].x, corn[0].y,
			corn[1].x, corn[1].y,
			corn[3].x, corn[3].y,
			corn[2].x, corn[2].y
		};
	}
}

float rot = -0.05f;
int main(int argc, char **argv) {
	gfxInitDefault();
	C3D_Init(C3D_DEFAULT_CMDBUF_SIZE);
	C2D_Init(C2D_DEFAULT_MAX_OBJECTS);
	C2D_Prepare();
	consoleInit(GFX_BOTTOM, NULL);

	// Create screens
	C3D_RenderTarget* top  = C2D_CreateScreenTarget(GFX_TOP, GFX_LEFT);

	// u32 kDownOld = 0, kHeldOld = 0, kUpOld = 0;

	//colors
	u32 clrClear = C2D_Color32(0x1E, 0x1E, 0x2E, 0xFF);

	while (aptMainLoop()) {
		hidScanInput();
		u32 kDown = hidKeysDown(); u32 kHeld = hidKeysHeld(); u32 kUp = hidKeysUp();
		if (kDown & KEY_START) paused = !paused;
		if (kDown & KEY_START && kHeld & KEY_R) break;

		printf("\x1b[1;0HFrame: %i", frame);
		printf("\x1b[2;0HCPU: %6.2f%% | GPU: %6.2f%%\x1b[K", C3D_GetProcessingTime()*6.0f, C3D_GetDrawingTime()*6.0f);
		printf("\x1b[3;0HCmdBuf:  %6.2f%%\x1b[K", C3D_GetCmdBufUsage()*100.0f);
		printf("\x1b[4;0HGravity: %f", gravity);
		printf("\x1b[5;0HFriction: %f", ply.friction);
		if (paused) printf("\x1b[7;0HPHYSICS PAUSED"); else printf("\x1b[7;0H              ");

		if (kDown & KEY_DLEFT) ply.mov.l = true;
		if (kDown & KEY_DRIGHT) ply.mov.r = true;

		if (kUp & KEY_DLEFT) ply.mov.l = false;
		if (kUp & KEY_DRIGHT) ply.mov.r = false;

		if (kDown & KEY_DUP && ply.grounded) {
			ply.yVel -= ply.jumpHeight;
			ply.grounded = false;
		}

		if (kDown & KEY_L) showPaths = !showPaths;

		// calculate physics
		if (!paused) {
			if (ply.mov.l) {
				if (ply.grounded) ply.xVel -= ply.movSpeed;
				else ply.xVel -= ply.movSpeed * ply.airFactor;
				if (ply.xVel < -ply.xCap) ply.xVel = -ply.xCap;
			}

			if (ply.mov.r) {
				if (ply.grounded) ply.xVel += ply.movSpeed;
				else ply.xVel += ply.movSpeed * ply.airFactor;
				if (ply.xVel > ply.xCap) ply.xVel = ply.xCap;
			}

			if (!ply.grounded) {ply.yVel += gravity;}
			if (!ply.mov.l && !ply.mov.r) ply.xVel *= ply.friction;
			if (ply.xVel < 0.1f && ply.xVel > -0.1f) ply.xVel = 0;

			ply.x += ply.xVel;
			ply.y += ply.yVel;

			if (ply.y + ply.h >= S_HEIGHT) {
				ply.y = S_HEIGHT - ply.h;
				ply.yVel = 0;
				ply.grounded = true;
			}
			if (ply.x + ply.w >= S_WIDTH) {
				ply.x = S_WIDTH - ply.w;
				ply.xVel = 0;
			}
			if (ply.x <= 0) {
				ply.x = 0;
				ply.xVel = 0;
			}
			if (ply.y <= 0) {
				ply.y = 0;
				ply.yVel = 0;
			}
		}

		// Render scene
		C3D_FrameBegin(C3D_FRAME_SYNCDRAW);
		C2D_TargetClear(top, clrClear);
		C2D_SceneBegin(top);

		// draw player
		drawGradientRect(ply.x, ply.y, ply.w, ply.h, 3, C2D_Color32(0xF5, 0xC2, 0xE7, 0xFF), 0x6C, 0x70, 0x86, 0x6C, 0x70, 0x86, 255);

		C3D_FrameEnd(0);

		/*gfxFlushBuffers();
		gfxSwapBuffers();
		gspWaitForVBlank();*/

		// kDownOld = kDown; kHeldOld = kHeld; kUpOld = kUp;
		frame++;
	}

	C2D_Fini();
	C3D_Fini();
	gfxExit();
	return 0;
}
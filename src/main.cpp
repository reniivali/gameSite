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
	/*X, Y*/      20, 750,
	/*W, H*/      20, 40,
	/*xVel, yVel*/0, 0,
	/*xCap*/      10.0f,
	/*friction*/  0.9f,
	/*jumpHeight*/12.5f,
	/*movSpeed*/  2.5f,
	/*airFactor*/ 0.5f,
	/*coins*/     0,
	/*mov L, R*/  {false, false},
	/*grounded*/  false
};

struct obstacle {
	float x, y;
	int w, h;
	int bord;
	int type;
};

struct coord {
	float x, y;
};

struct rotRect {
	coord tl, tr, bl, br;
};

bool paused = false;
float gravity = 0.5f;

// platform = 0, wall = 1
const int worldSize = 6;
const int worldHeight = 1000;
const int worldWidth = 1000;
int screenPosX = 0;
int screenPosY = 750;
obstacle world[worldSize] = {
	//walls
	{-5,0,15,worldHeight,3,1},
	{10,-5,worldWidth-20,15,3,0},
	{worldWidth-10,0,15,worldHeight,3,1},
	{10,worldHeight-10,worldWidth-20,15,3,0},
	//objects
	{250,840,100,20,3,0},
	{250,860,20,120,3,1}
};

static void drawGradientRect(float x, float y, float w, float h, float p, u32 color, int r1, int g1, int b1, int r2, int g2, int b2, int opacity) {
	C2D_DrawRectangle(x, y, 0, w, h, C2D_Color32(r1, g1, b1, opacity), C2D_Color32((r1*w/(w+h) + r2*h/(w+h)), (g1*w/(w+h) + g2*h/(w+h)), (b1*w/(w+h) + b2*h/(w+h)), opacity), C2D_Color32((r1*h/(w+h) + r2*w/(w+h)), (g1*h/(w+h) + g2*w/(w+h)), (b1*h/(w+h) + b2*w/(w+h)), opacity), C2D_Color32(r2, g2, b2, opacity));
	C2D_DrawRectSolid(x + p, y + p, 0, w - p * 2, h - p * 2, color);
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
		printf("\x1b[4;0HPlayer X: %f", ply.x);
		printf("\x1b[5;0HPlayer XVel: %f", ply.xVel);
		printf("\x1b[7;0HPlayer Y: %f", ply.y);
		printf("\x1b[8;0HPlayer YVel: %f", ply.yVel);
		printf("\x1b[10;0HScreen X: %i", screenPosX);
		printf("\x1b[11;0HScreen Y: %i", screenPosY);
		if (paused) printf("\x1b[15;0HPHYSICS PAUSED"); else printf("\x1b[15;0H              ");

		if (kDown & KEY_DLEFT) ply.mov.l = true;
		if (kDown & KEY_DRIGHT) ply.mov.r = true;

		if (kUp & KEY_DLEFT) ply.mov.l = false;
		if (kUp & KEY_DRIGHT) ply.mov.r = false;

		if (kDown & KEY_DUP && ply.grounded) {
			ply.yVel -= ply.jumpHeight;
			ply.grounded = false;
		}

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

			//obstacle collision
			bool onPlatform = false;
			for (int i = 0; i < worldSize; i++) {
				if (ply.x + ply.w >= world[i].x && ply.x <= world[i].x + world[i].w && ply.y + ply.h >= world[i].y && ply.y <= world[i].y + world[i].h) {
					switch (world[i].type) {
						case 0:
							if (ply.y >= world[i].y) {
								// colliding with bottom
								ply.y = world[i].y + world[i].h;
								ply.yVel = 0;
							} else if (ply.y <= world[i].y) {
								//colliding with top
								ply.y = world[i].y - ply.h;
								ply.yVel = 0;
								ply.grounded = true;
								onPlatform = true;
							}
							break;
						case 1:
							if (ply.x >= world[i].x) {
								//colliding with right
								ply.x = world[i].x + world[i].w;
								ply.xVel = 0;
							} else if (ply.x <= world[i].x) {
								//colliding with left
								ply.x = world[i].x - ply.w;
								ply.xVel = 0;
							}
							break;
					}
				} else if (!onPlatform) ply.grounded = false;
			}

			//bounds collision, keep at bottom
			if (ply.y + ply.h >= worldHeight) {
				ply.y = worldHeight - ply.h;
				ply.yVel = 0;
				ply.grounded = true;
			}
			if (ply.x + ply.w >= worldWidth) {
				ply.x = worldWidth - ply.w;
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

			//cam movement
			if (ply.x <= screenPosX + 20 && ply.xVel < 0) screenPosX += ply.xVel;
			if (ply.x + ply.w >= screenPosX + S_WIDTH - 20 && ply.xVel > 0) screenPosX += ply.xVel;
			if (ply.y <= screenPosY + 20 && ply.yVel < 0) screenPosY += ply.yVel;
			if (ply.y + ply.h >= screenPosY + S_HEIGHT - 20 && ply.yVel > 0) screenPosY += ply.yVel;

			//make sure player is in frame
			if (ply.x < screenPosX) screenPosX = ply.x - 20;
			if (ply.y < screenPosY) screenPosY = ply.y - 20;
			if (ply.x + ply.w > screenPosX + S_WIDTH) screenPosX = ply.x - S_WIDTH + 20;
			if (ply.y + ply.h > screenPosY + S_HEIGHT) screenPosY = ply.y - S_HEIGHT + 20;

			if (screenPosX < 0) screenPosX = 0;
			if (screenPosY < 0) screenPosY = 0;
			if (screenPosX > worldWidth - S_WIDTH) screenPosX = worldWidth - S_WIDTH;
			if (screenPosY > worldHeight - S_HEIGHT) screenPosY = worldHeight - S_HEIGHT;
		}

		// Render scene
		C3D_FrameBegin(C3D_FRAME_SYNCDRAW);
		C2D_TargetClear(top, clrClear);
		C2D_SceneBegin(top);

		// draw world
		int drawn = 0;
		for (int i = 0; i < worldSize; i++) {
			//check to see if object is in frame
			if (
				world[i].x + world[i].w >= screenPosX &&
				world[i].x <= screenPosX + S_WIDTH &&
				world[i].y + world[i].h >= screenPosY &&
				world[i].y <= screenPosY + S_HEIGHT
			) {
				drawGradientRect(
					world[i].x - screenPosX,
					world[i].y - screenPosY,
					world[i].w,
					world[i].h,
					3,
					C2D_Color32(0xFA, 0xB3, 0x87, 0xFF),
					0x6C, 0x70, 0x86,
					0x6C, 0x70, 0x86,
					255
				);
				drawn++;
			}
		}

		printf("\x1b[13;0HDrawn Objects / Total: %i / %i", drawn, worldSize);

		// draw player
		drawGradientRect(
			ply.x - screenPosX,
			ply.y - screenPosY,
			ply.w,
			ply.h,
			3,
			C2D_Color32(0xF5, 0xC2, 0xE7, 0xFF),
			0x6C, 0x70, 0x86,
			0x6C, 0x70, 0x86,
			255
		);

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
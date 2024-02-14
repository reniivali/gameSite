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
	/*X, Y*/      20, 9750,
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

bool paused = false;
float gravity = 0.5f;
int udef = 0;

struct obstacle {
	float x, y;
	int w, h;
	int bord;
	int type;
	int d1, d2;
};

// platform = 0, wall = 1, coin = 2, portal = 3, jumpPad = 4, deco = 5, decotri = 6, decotribord = 7;
// d1 and d2 are extra properties for certain object types
const int worldSize = 27;
const int worldHeight = 10000;
const int worldWidth = 10000;
const int gridSize = 50;
int screenPosX = 0;
int screenPosY = 750;
obstacle world[worldSize] = {
	//walls
	/*left border*/{-5,0,15,worldHeight,3,1,udef,udef},
	/*top border*/{10,-5,worldWidth-20,15,3,0,udef,udef},
	/*right border*/{worldWidth-10,0,15,worldHeight,3,1,udef,udef},
	/*bottom border*/{10,worldHeight-10,worldWidth-20,15,3,0,udef,udef},
	/*bottom-left cover*/{0,worldHeight-7,15,7,0,0,udef,udef},
	/*bottom-right cover*/{worldWidth-15,worldHeight-7,15,7,0,0,udef,udef},
	/*top-left cover*/{0,0,15,7,0,0,udef,udef},
	/*top-right cover*/{worldWidth-15,0,15,7,0,0,udef,udef},
	//objects
	{250,9840,100,20,3,0,udef,udef},
	{250,9860,20,130,3,1,udef,udef},
	{290,9880,20,20,3,2,udef,udef},
	{500,9980,20,10,3,4,15,udef},
	{800,9800,80,80,3,3,10,10},

	//top-left
	{10,100,100,20,3,0,udef,udef},
	{90,120,20,50,3,1,udef,udef},
	{90,170,100,20,3,0,udef,udef},
	{7,103,6,14,0,5,udef,udef},
	{93,103,14,70,0,5,udef,udef},
	{10,300,300,20,3,0,udef,udef},
	{290,280,200,20,3,0,udef,udef},
	{200,360,400,20,3,0,udef,udef},
	{310,300,330,300,0,7,310,320},
	{307,294,330,294,0,6,307,317},
	{270,300,290,300,0,7,290,280},
	{273,303,293,303,0,6,293,283},
	{293,297,20,6,0,5,udef,udef},
	{7,303,6,14,0,5,udef,udef}
};

static void drawGradientRect(float x, float y, float w, float h, float p, u32 color, int r1, int g1, int b1, int r2, int g2, int b2, int opacity) {
	if (p > 0) C2D_DrawRectangle(x, y, 0, w, h, C2D_Color32(r1, g1, b1, opacity), C2D_Color32((r1*w/(w+h) + r2*h/(w+h)), (g1*w/(w+h) + g2*h/(w+h)), (b1*w/(w+h) + b2*h/(w+h)), opacity), C2D_Color32((r1*h/(w+h) + r2*w/(w+h)), (g1*h/(w+h) + g2*w/(w+h)), (b1*h/(w+h) + b2*w/(w+h)), opacity), C2D_Color32(r2, g2, b2, opacity));
	C2D_DrawRectSolid(x + p, y + p, 0, w - p * 2, h - p * 2, color);
}

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
		circlePosition cPos;
		hidCircleRead(&cPos);

		float camfac = 0.05f;

		//make sure player is in frame
		if (ply.x < screenPosX) screenPosX = ply.x;
		if (ply.y < screenPosY) screenPosY = ply.y;
		if (ply.x + ply.w > screenPosX + S_WIDTH) screenPosX = (ply.x + ply.w) - S_WIDTH;
		if (ply.y + ply.h > screenPosY + S_HEIGHT) screenPosY = (ply.y + ply.h) - S_HEIGHT;

		hidScanInput();
		u32 kDown = hidKeysDown(); u32 kHeld = hidKeysHeld(); u32 kUp = hidKeysUp();
		if (kDown & KEY_START) paused = !paused;
		if (kDown & KEY_START && kHeld & KEY_R) break;
		if (kHeld & KEY_Y) ply.xCap = 15.0f;
		if (kUp   & KEY_Y) ply.xCap = 10.0f;

		if (cPos.dx < -39 || cPos.dx > 39) {
			if (kHeld & KEY_X) {
				screenPosX += cPos.dx * camfac;
				ply.mov.l = false;
				ply.mov.r = false;
			} else {
				if (cPos.dx > 0) {
					ply.mov.r = true;
					ply.mov.l = false;
				} else {
					ply.mov.r = false;
					ply.mov.l = true;
				}
			}
		} else {
			ply.mov.l = false;
			ply.mov.r = false;
		}

		if (cPos.dy < -39 || cPos.dy > 39) {
			if (kHeld & KEY_X) screenPosY += -cPos.dy * camfac;
		}

		printf("\x1b[1;0HFrame: %i", frame);
		printf("\x1b[2;0HCPU: %6.2f%% | GPU: %6.2f%%\x1b[K", C3D_GetProcessingTime()*6.0f, C3D_GetDrawingTime()*6.0f);
		printf("\x1b[3;0HCmdBuf:  %6.2f%%\x1b[K", C3D_GetCmdBufUsage()*100.0f);
		printf("\x1b[4;0HPlayer X: %f", ply.x);
		printf("\x1b[5;0HPlayer XVel: %f", ply.xVel);
		printf("\x1b[7;0HPlayer Y: %f", ply.y);
		printf("\x1b[8;0HPlayer YVel: %f", ply.yVel);
		printf("\x1b[10;0HScreen X: %i", screenPosX);
		printf("\x1b[11;0HScreen Y: %i", screenPosY);
		printf("\x1b[14;0HCoins: %i", ply.coins);
		if (paused) printf("\x1b[15;0HPHYSICS PAUSED"); else printf("\x1b[15;0H              ");

		if (kDown & KEY_DLEFT) ply.mov.l = true;
		if (kDown & KEY_DRIGHT) ply.mov.r = true;

		if (kUp & KEY_DLEFT) ply.mov.l = false;
		if (kUp & KEY_DRIGHT) ply.mov.r = false;

		if (kDown & KEY_DUP && ply.grounded) {
			ply.yVel -= ply.jumpHeight;
			ply.grounded = false;
		}

		if (kDown & KEY_B && ply.grounded) {
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
				if (world[i].type != 5 && world[i].type != 6 && world[i].type != 7) {
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
							case 2:
								ply.coins++;
								world[i].x = -1;
								world[i].y = -1;
								world[i].w = 1;
								world[i].h = 1;
								break;
							case 3:
								ply.x = world[i].d1;
								ply.y = world[i].d2;
								break;
							case 4:
								ply.grounded = false;
								ply.yVel -= world[i].d1;
								break;
							default:
								printf("\x1b[20;0HUNKNOWN OBJECT TYPE AT INDEX %i", i);
						}
					} else if (!onPlatform) ply.grounded = false;
				}
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
			if (ply.x < screenPosX) screenPosX = ply.x;
			if (ply.y < screenPosY) screenPosY = ply.y;
			if (ply.x + ply.w > screenPosX + S_WIDTH) screenPosX = (ply.x + ply.w) - S_WIDTH;
			if (ply.y + ply.h > screenPosY + S_HEIGHT) screenPosY = (ply.y + ply.h) - S_HEIGHT;
			if (screenPosX < 0) screenPosX = 0;
			if (screenPosY < 0) screenPosY = 0;
			if (screenPosX > worldWidth - S_WIDTH) screenPosX = worldWidth - S_WIDTH;
			if (screenPosY > worldHeight - S_HEIGHT) screenPosY = worldHeight - S_HEIGHT;
		}

		// Render scene
		C3D_FrameBegin(C3D_FRAME_SYNCDRAW);
		C2D_TargetClear(top, clrClear);
		C2D_SceneBegin(top);

		int drawnGrid = 0;
		int xfac = screenPosX % (gridSize * 2);
		int yfac = screenPosY % (gridSize * 2);
		float currentX = -xfac;
		float currentY = -yfac;
		int yNum = 0;
		while (currentY < S_HEIGHT) {
			if (yNum % 2 == 1) {currentX += gridSize;}
			while (currentX < S_WIDTH) {
				drawGradientRect(
					currentX, currentY,
					gridSize, gridSize, 0,
					C2D_Color32(0x18, 0x18, 0x25, 0xFF),
					0x18, 0x18, 0x25,
					0x18, 0x18, 0x25,
					255
				);
				currentX += gridSize * 2;
				drawnGrid++;
			}
			currentX = -(screenPosX % (gridSize * 2));
			currentY += gridSize;
			yNum++;
		}

		// draw world
		int drawn = 0;
		for (int i = 0; i < worldSize; i++) {
			//check to see if object is in frame
			if (
				world[i].type == 6 || world[i].type == 7 ||
				(
					world[i].x + world[i].w >= screenPosX &&
					world[i].x <= screenPosX + S_WIDTH &&
					world[i].y + world[i].h >= screenPosY &&
					world[i].y <= screenPosY + S_HEIGHT
				)
			) {
				switch (world[i].type) {
					case 0:
						drawGradientRect(
							world[i].x - screenPosX,
							world[i].y - screenPosY,
							world[i].w,
							world[i].h,
							world[i].bord,
							C2D_Color32(0xFA, 0xB3, 0x87, 0xFF),
							0x6C, 0x70, 0x86,
							0x6C, 0x70, 0x86,
							255
						);
						break;
					//i don't like repeating this but i couldn't get a double case to work
					case 1:
						drawGradientRect(
							world[i].x - screenPosX,
							world[i].y - screenPosY,
							world[i].w,
							world[i].h,
							world[i].bord,
							C2D_Color32(0xFA, 0xB3, 0x87, 0xFF),
							0x6C, 0x70, 0x86,
							0x6C, 0x70, 0x86,
							255
						);
						break;
					case 2:
						drawGradientRect(
							world[i].x - screenPosX,
							world[i].y - screenPosY,
							world[i].w,
							world[i].h,
							world[i].bord,
							C2D_Color32(0xF5, 0xC2, 0xE7, 0xFF),
							0x6C, 0x70, 0x86,
							0x6C, 0x70, 0x86,
							255
						);
						break;
					case 3:
						drawGradientRect(
							world[i].x - screenPosX,
							world[i].y - screenPosY,
							world[i].w,
							world[i].h,
							world[i].bord,
							C2D_Color32(0xCB, 0xA6, 0xF7, 0xFF),
							0x6C, 0x70, 0x86,
							0x6C, 0x70, 0x86,
							255
						);
						break;
					case 4:
						drawGradientRect(
							world[i].x - screenPosX,
							world[i].y - screenPosY,
							world[i].w,
							world[i].h,
							world[i].bord,
							C2D_Color32(0xA6, 0xE3, 0xA1, 0xFF),
							0x6C, 0x70, 0x86,
							0x6C, 0x70, 0x86,
							255
						);
						break;
					case 5:
						drawGradientRect(
							world[i].x - screenPosX,
							world[i].y - screenPosY,
							world[i].w,
							world[i].h,
							world[i].bord,
							C2D_Color32(0xFA, 0xB3, 0x87, 0xFF),
							0x6C, 0x70, 0x86,
							0x6C, 0x70, 0x86,
							255
						);
						break;
					case 6:
						if (
							/*X1, Y1*/(world[i].x  >= screenPosX && world[i].x  <= screenPosX + S_WIDTH && world[i].y  >= screenPosY && world[i].y  <= screenPosY + S_HEIGHT) ||
							/*X2, Y2*/(world[i].w  >= screenPosX && world[i].w  <= screenPosX + S_WIDTH && world[i].h  >= screenPosY && world[i].h  <= screenPosY + S_HEIGHT) ||
							/*X3, Y3*/(world[i].d1 >= screenPosX && world[i].d1 <= screenPosX + S_WIDTH && world[i].d2 >= screenPosY && world[i].d2 <= screenPosY + S_HEIGHT)
						) {
							C2D_DrawTriangle(
								world[i].x  - screenPosX, world[i].y  - screenPosY, C2D_Color32(0xFA, 0xB3, 0x87, 0xFF),
								world[i].w  - screenPosX, world[i].h  - screenPosY, C2D_Color32(0xFA, 0xB3, 0x87, 0xFF),
								world[i].d1 - screenPosX, world[i].d2 - screenPosY, C2D_Color32(0xFA, 0xB3, 0x87, 0xFF),
								0
							);
						} else drawn--; //janky ass ahh motherfucker
						break;
					case 7:
						if (
							/*X1, Y1*/(world[i].x  >= screenPosX && world[i].x  <= screenPosX + S_WIDTH && world[i].y  >= screenPosY && world[i].y  <= screenPosY + S_HEIGHT) ||
							/*X2, Y2*/(world[i].w  >= screenPosX && world[i].w  <= screenPosX + S_WIDTH && world[i].h  >= screenPosY && world[i].h  <= screenPosY + S_HEIGHT) ||
							/*X3, Y3*/(world[i].d1 >= screenPosX && world[i].d1 <= screenPosX + S_WIDTH && world[i].d2 >= screenPosY && world[i].d2 <= screenPosY + S_HEIGHT)
						) {
							C2D_DrawTriangle(
								world[i].x  - screenPosX, world[i].y  - screenPosY, C2D_Color32(0x6C, 0x70, 0x86, 0xFF),
								world[i].w  - screenPosX, world[i].h  - screenPosY, C2D_Color32(0x6C, 0x70, 0x86, 0xFF),
								world[i].d1 - screenPosX, world[i].d2 - screenPosY, C2D_Color32(0x6C, 0x70, 0x86, 0xFF),
								0
							);
						} else drawn--;
						break;
				}
				drawn++;
			}
		}

		printf("\x1b[13;0HDrawn: %i / %i, %i Grid Squares", drawn, worldSize, drawnGrid);

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
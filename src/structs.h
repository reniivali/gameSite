#include <3ds.h>
#include <citro2d.h>

#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

/* ideas for enemies
enemies can jump based off of a ~1/100 chance every frame whilst they are grounded? (for later implementation)

player can attack with a button press that jabs a "spear" out in front of them?
*/

struct moving {
	bool l, r;
};

struct enemy {
	float health;
	int   dir; // direction, -1 = l, 1 = r;
	float x, y;
	int   w, h;
	float xVel, vTarget, vFac; // x velocity, velocity target, and velocity factor
	float sMin, sMax; // min/max speed (for random choice range)
	float xMin, xMax; // min/max X position (movement range)
	int   mTime, mTmin, mTmax; // time enemy will move for, maximum possible time, minmum possible time (all in frames)
	int   damage;
	bool alive;
};

struct player {
	float health;
	float stamina;
	int dir; // direction, -1 = l, 1 = r;
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
	int drawSword;
};

struct obstacle {
	float x, y;
	int w, h;
	int bord;
	int type;
	int d1, d2;
	u32 col;
};
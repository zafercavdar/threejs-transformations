University of British Columbia, Vancouver
Winter 2017 Term 2
CPSC 314 Computer Graphics
Assignment #3
Student Name: Zafer Cavdar
Student ID: 51503035
CS Username: g0o1b

References:
To use more three.js features, I consulted three.js documentation on
https://threejs.org/docs/#api/
Floor image is downloaded from: https://wallpaperscraft.com/image/line_black_white_motion_optical_illusion_63555_3840x2400.jpg
No other external source is used.(No additional library or code snippet written by someone else.)

Additional keystores defined:
l - on/off laser beam
t - backward/forward motion in time
q - increase light intensity
w - decrease light intensity
f - flip the dino
j - launch the latest Space-X Rocket

Implemented features in (h):
- keystroke to make changes to the lighting
	light intensity is controlled by q and w keys.
- have a key that makes your dino jump or flip
	after pressing f; trex, minicooper and dino pauses its animation, dino flips itself and
	3 of them start moving again.
- have a trex follow the minicooper, which is following you
	trex is following minicooper's circular path and
	minicooper is also following dino's circular path.
	if time is reversed, they go back all together.

Additional work that could be considered as bonus (i):
- complete more of the suggested ideas above
	completed 3 of the elective features
- motion of Space-X rocket
	rocket is placed at the origin. after pressing j key, it is launched and it goes until y = 10 and
	returns back to its initial place.
- create a plant or tree with animated branches or leaves
	a tree with a body, two branchs and 4 leaves are implemented.
	except of body, other parts are waving.

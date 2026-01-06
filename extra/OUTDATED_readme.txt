--------------- Controls ---------------

SPACEBAR - scramble the puzzle
ESC - reset the puzzle (this will clear all of your times if you are doing a solve)

+/- - change the puzzle size
ALT and +/- - change the width of the puzzle
CTRL and +/- - change the height of the puzzle

CTRL and F1, F2, ..., F12 - save the puzzle in slot 1-12 (only when solving)
F1, F2, ..., F12 - load the puzzle saved in slot 1-12

CTRL and S - save the puzzle with a custom file name
CTRL and O - load a save file

CTRL and ENTER - enter fullscreen mode (with time grid, buttons and chat)
ALT and ENTER - enter fullscreen mode (only shows the timer, movecount and TPS of the current solve)

PAGE UP - zoom in
PAGE DOWN - zoom out
HOME - reset zoom to default
END - zoom to fit the puzzle in the window
CTRL and END - zoom to fit the puzzle to the longer side of the window

CTRL and C - copy the current state to the clipboard (also works on puzzles in multiplayer)
CTRL and V - set the current state to the state currently in the clipboard (space between each number, new line for each row of the puzzle, use 0 to indicate the blank space), or view a reconstruction/replay
CTRL and Z - retry the scramble of the previous solve (won't count towards PBs and won't count as a solve in the current session)
CTRL and P - render an image of the current state of the puzzle. Also works on puzzles in multiplayer, just click the puzzle first. Supported formats: bmp, jpg, jpeg, png, ppm, tiff, xbm, xpm

1 - switch to previous colour scheme and resize handshifts
2 - switch to next colour scheme and resize handshifts
3 - shrink handshift from the left
4 - expand handshift from the left
5 - expand handshift from the top
6 - shrink handshift from the top
7 - shrink handshift from the right
8 - expand handshift from the right
9 - expand handshift from the bottom
0 - shrink handshift from the bottom


--------------- Settings ---------------

Change puzzle size - type in a puzzle size in the format "[width]x[height]" (without quotes), eg. "4x4" to change to that puzzle

Changing any setting with an asterisk (*) will clear the current session

Settings are saved automatically when the settings window is closed

Display types:
 Standard - normal puzzle
 Minimal - only the top left tile is visible
 Row minimal - only the top row is visible
 Fringe minimal - only the top row and left column are visible
 Inverse permutation - the inverse scramble is shown instead of the actual scramble
 Manhattan - each tile shows the manhattan distance away from solved (|x-solved_x|+|y-solved_y|)
 Vectors - each tile shows an arrow pointing to its solved position
 Incremental vectors - tile 1 points to tile 2, tile 2 points to tile 3, etc. and the last tile is blank
 Inverse vectors - inverse permutation + vectors
 RGB - red = correct row, blue = correct column, green = solved
 Chess - rook = correct row or column, bishop = correct diagonal, knight = a knight-move away from solved, king = solved
 Adjacent tiles - only the 2, 3 or 4 tiles adjacent to the blank are shown
 Adjacent sum - each tile shows the sum of the 2, 3 or 4 tiles adjacent to it
 Last move - only the last tile that moved is shown
 Fading tiles - when a tile is moved, its opacity will decrease, until it disappears after 2N moves on an NxN puzzle, or 2sqrt(NM) moves on an NxM puzzle
 Vanish on solved - once a tile is moved into its solved position, it will turn blank
 Minesweeper - the number on each tile is the number of solved adjacent tiles
 Minimal unsolved - the smallest-valued unsolved tile is shown, and all other tiles are hidden
 Maximal unsolved - the largest-valued unsolved tile is shown, and all other tiles are hidden
 Rows and columns - the number on each tile is the number of solved tiles in the same row or column


--------------- Leaderboards ---------------

You can use the leaderboards to see other peoples PBs. Just choose whatever settings you want from the list of filters, and click get leaderboard.

To put your PBs on the leaderboard, click leaderboard account and choose a username and password, enter your email address and click create account

You should receive an email with an account activation link. Click it, then go back to the sim and enter your username and password and login. Make sure that the "log in automatically" box is checked, so you won't need to keep manually logging in.

Click the upload all PBs button to add your current PBs to the leaderboard. You should see a popup when your PBs have finished uploading.

When you are logged in, any new PBs you get will be automatically uploaded to the leaderboard, so you shouldn't need to use the upload all PBs button again.


--------------- Solver ---------------

In the regions text box, you can type each region on a new line, with a space between each tile number. You can also type something like "1-4" to include tiles 1, 2, 3 and 4. Select a preset from the dropdown box to see an example.

When you click load solver, the solver will generate a table which will allow it to optimally solve the tiles in that region, assuming all previous regions are already solved.

Once the solver has finished loading, you can scramble the puzzle, then click solve puzzle in the solver tab, then click apply solution to watch the solver solve the puzzle.


--------------- Multiplayer ---------------

Making a server -  
 Port forward TCP port 1234 -  
  Press windows key + R
  Type "cmd" and press enter
  Type "ipconfig" and press enter - you should see "IPv4 Address" and "Default Gateway"
  Open your internet browser and type the default gateway in the URL bar and press enter
  You will probably need to input a username and password to access your routers settings
  Look for "Port forwarding" (its probably in advanced settings somewhere)
  Forward a new port - 
   Set the start and end ports to 1234
   Set the protocol to TCP (if this is an option)
   Set the IP address to your IPv4 address
  Make sure your antivirus/firewall isnt blocking 1234 as an outgoing TCP port
 Click multiplayer, then click start server

You can check if the port is open by using this website with the port 1234 when the server is running: https://www.yougetsignal.com/tools/open-ports/

Connecting to a server - click multiplayer, type in the IP and choose a username, then click connect to server. If you are connecting to your own server, put "localhost" for the IP address, otherwise put the IP address of the server (make sure it is the external IP, not the internal IP. Go to www.cmyip.com to get your external IP)

Type "/countdown <n>" or "/c <n>" in the chat to start an n second countdown
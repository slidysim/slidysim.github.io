# Slidysim Readme 2025

Updated version written by dphdmn of a [classic Slidysim Readme](https://github.com/dphdmn/openslidy/blob/main/extra/OUTDATED_readme.txt) txt file.

## Controls

### Basic controls

``SPACEBAR`` - scramble the puzzle

``ESC`` - reset the puzzle (this will clear all of your times if you are doing a solve)

``+/-`` - change the puzzle size

``PAGE UP`` / ``PAGE DOWN`` - zoom in / zoom out

``END`` - zoom to fit the puzzle in the window

``1`` - switch to previous colour scheme in Grids mode

``2`` - switch to next colour scheme in Grids mode

> [!TIP]
> Holding ``CTRL`` or ``Any Mouse button`` will prevent any moves in Hover input mode. (This is very useful to setup mouse position before solve).

### Advanced controls

#### Size changes

``ALT and +/-`` - change the width of the puzzle

``CTRL and +/-`` - change the height of the puzzle

``SHIFT and +/-`` - enter specific puzzle size in format "[width]x[height]"

> [!TIP]
> You can use ``Settings -> Puzzle -> Change puzzle size``. But ``SHIFT and +/-`` is the easiest way to do the same thing. You don't really need any other shortcuts with that.

#### View changes

``ALT and ENTER`` - enter true fullscreen mode (timer only)

``CTRL and ENTER`` - enter fake fullscreen mode (with stats)

``HOME`` - reset zoom to default

``CTRL and END`` - zoom to fit the puzzle to the longer side of the window

``Mouse wheel`` - Scroll vertically

``Mouse wheel and SHIFT`` - Scroll vertically Faster

``Mouse wheel and Alt`` - Scroll horizontally

``Mouse wheel and Alt and SHIFT`` - Scroll horizontally Faster

> [!TIP]
> You can always use your mouse on stats section and drag it to hide or resize stats. So in fake fullscreen mode you can hide your stats completely if that's your goal. Slidysim does not, however, support centering the puzzle, so both fullscreen modes may be completely useless.

#### Scrambles and solutions

``CTRL and C`` - copy the current state to the clipboard

``CTRL and V`` - set the current state to the clipboard (or view a reconstruction)

``CTRL and Z`` - retry the scramble of the previous solve (won't count as real solve)

``CTRL and P`` - render an image of the current state of the puzzle.

> [!IMPORTANT]
> Scramble format: ``5 3 8 9/0 2 4 1/7 10 14 13/12 11 6 15``
>
> Solution format: ``URDL2UR2DLUR2ULURDL2URDLUL``

```
U - tile moves to the top
L - tile moves to the left
D - tile moves to the bottom
R - tile moves to the right
Numbers such as "L2" or "R100" means repetition of the same move
```

> [!TIP]
> You can play solution directly in Slidysim with specific TPS using ``CTRL and V``. But for replay it's better to use [dedicated replay tool](https://slidysim.github.io/replay) 
>
> You can also use ``!animate`` command in [discord](https://discord.gg/7vXrWAS3yZ) egg bot.
>
> You can also use automated replay tools such as [SST](https://github.com/dphdmn/slidysimSessionTracker/tree/main)

> [!WARNING]
> Please don't use ``CTRL and P``, use ``!draw`` command in discord instead. ``CTRL and P`` is producing very buggy images.

#### Save and load

``CTRL and F1, F2, ..., F12`` - save the puzzle in slot 1-12

``F1, F2, ..., F12`` - load the puzzle saved in slot 1-12

``CTRL and S`` - save the puzzle with a custom file name

``CTRL and O`` - load a save file

> [!IMPORTANT]
> Main purpose of the save/load system is to save ONE very long solve. Saving DOES also work in long marathons on relays. After loading a marathon/relay, the counter will update on next solve completion.

> [!WARNING]
> You can only save during solving. Saving does NOT keep the current session (such as averages)

> [!CAUTION]
> Abusing save/load system to repeat same part of solution is considered cheating.
>
> Abusing save/load system to change color scheme mid-solve is considered cheating.

#### Extra handshift keys

> [!NOTE]
> No one really uses these

``Space`` - during grids mode, extends the current handshift to the whole puzzle

``3`` - shrink handshift from the left

``4`` - expand handshift from the left

``5`` - expand handshift from the top

``6`` - shrink handshift from the top

``7`` - shrink handshift from the right

``8`` - expand handshift from the right

``9`` - expand handshift from the bottom

``0`` - shrink handshift from the bottom

## Settings

> [!WARNING]
> Changing any setting with an asterisk (*) will clear the current session.

### Appearance

``Font`` - You can change the font of the numbers on the puzzle to any font installed on your system

``Bold`` / ``Italic`` / ``Underline`` / ``Font size`` - self-explanatory settings, regarding font

``Gap between tiles`` - Don't use this in Hover mode (slide all the way to the left)

``Main border`` - optional visual-only border for the tiles

``Secondary border`` - optional border for the Grids mode, applied to a rectangle under numbers

``Base`` - changing the numeral system base ([radix](https://en.wikipedia.org/wiki/Radix) of the numbers, might be useful on puzzles like 9x9 (with base 9).

``Handshift opacity`` - in grids mode, changes how dark is inactive part of the puzzle (right - darker)

``Auto-load colour schemes`` - Automatically change color schemes based on files in ``schemes`` folder (see below)

``Theme`` - Dark Changes UI elements to gray colors to not blind you with white mode, a bit glitchy

#### Color schemes

There is a folder called ``schemes`` that can have a bunch of color scheme files in formats like ``4x4.txt`` or ``10x5.txt``.

> [!TIP]
> You can find many color schemes used by slidysim players in [speedsliding](https://discord.gg/7vXrWAS3yZ) discord server
>
> Link to [vovker's color schemes](https://cdn.discordapp.com/attachments/802386000223404042/1342004826233507901/schemes.7z?ex=69005463&is=68ff02e3&hm=ba81db922ecd124b69f24b0a73616997e1c8954329a1a43820fd8fac2beb994b&)

> [!IMPORTANT]  
> Color schemes must be extracted to ``schemes`` folder, with NO subfolders inside, just as ``txt`` files.

Now, let's talk about edit color scheme mode.

- Each new row you add is a different Layer of color scheme.

- You can switch between different Layers during gameplay using ``1`` and ``2`` keys.

- Having more than 1 Layer is useful in puzzles starting from size 7x7 and bigger.

- For smaller puzzles like 4x4 or 5x5, 1 Layer is all you need.

- Using more than 1 Layer of color scheme is commonly referred in the community as "Grids" method.

- Order of Layers is important, you can change it with ``Move up`` or ``Move down`` buttons.

- On the very top of the list is the biggest, outer layer scheme (Grids).

- On the very bottom is the smallest, inner layer scheme (Fringe).

- You can add or remove specific layers using ``Add`` and ``Remove`` buttons.

- You can edit specific layer by double clicking on the specific row.

>[!NOTE]
> You can experiment yourself with the way the color scheme editor works. But I will explain the basic features you would need for normal speedsolving.

**Normal layer editing:**

- Start by adding new layer with ``Add`` button or double clicking any existing layer

- ``Scheme`` section has two rows, top row defines the structure of the color scheme, and lower row defines the hue/contrast of the colors used.

- Normal layers examples are ``Fringe``, ``L2L`` or ``Mono``.

- For speedsolving it is recommended to set it to ``Fringe 3``.

- For the lower row, set it to ``Rainbow (bright)``. Or use normal ``Rainbow`` for more contrast.

- Play around with it to find what's best for you, (scheme will update whenever editing window is closed).

- For normal layer don't change the ``Size`` or ``First/Second`` color codes (unless you are trying out alternating or gradient modes)

**Grids layer editing:**

- Start by selecting ``Row Grids`` in top row.

- On the lower row select ``Rainbow (bright)`` (easiest way with light red-blue colors)

- If you wish to customize the specific colors of 2-way Grids, set it to ``Alternating``

- Now configure the rectangle size of the Grids, based on the shape you want, for example use "4x8" for 8x8 puzzle.

- "4x8" will divide puzzle to left and right. "8x4" will divide puzzle to top and bottom.

- Think about it as cutting puzzle in equal halves, and halves must add up to a whole puzzle (or be bigger for odd puzzles)

- If you use alternating mode, use RGB color codes to change the colors of 2 parts of the grids (use some color picker in google)

**Hierarchy of grid layers:**

- For puzzles like 10x10 or even 20x20 you can stack up multiple grid layers

- Simply use the same settings, and order grids from biggest to smallest

- Pattern is usually very simple, cutting the following grids part in half

- When you are done with dividing, use one normal layer, such as fringe

**Here is example for 20x20:**

```
Row Grids - Rainbow (bright) - 20x10 <- Biggest grid layer, vertical sorting
Row Grids - Rainbow (bright) - 10x10 <- Horizontal sorting into 10x10 parts
Row Grids - Rainbow (bright) - 10x5 <- Vertical sorting inside 10x10
Row Grids - Rainbow (bright) - 5x5 <- Horizontal sorting of 10x5 parts into 5x5
Fringe 3 - Rainbow (bright) - 1x1 <- Normal fringe layer for 5x5 puzzle
```

> [!IMPORTANT]  
> After you are done with making color scheme, make sure to save it using ``Save`` button into ``schemes`` folder with name like ``20x20.txt``
>
> Make sure that ``Auto-load colour schemes`` is Enabled for that folder to work.

### Puzzle

#### Solve types

Changes between normal solves, relays, marathons, or BLD.

``Standard`` - Solve 1 puzzle

``2-N relay`` - Solve puzzles in order from current to 2x2 (like 5x5 -> 4x4 -> 3x3 -> 2x2)

``Height relay`` - Solve puzzles in order from current to Nx2 (like 5x5 -> 5x4 -> 5x3 -> 5x2)

``Width relay`` - Solve puzzles in order from current to 2xN (like 5x5 -> 4x5 -> 3x5 -> 2x5)

``Everything-up-to relay`` - Combination of all relays (all NxM puzzles) (like 4x4 -> 3x4 -> 2x4 -> 4x3 -> 3x3 -> 2x3 -> 4x2 -> 3x2 -> 2x2)

``Marathon`` - Solve N puzzles of same size in a row based on N specified in ``Marathon length`` (from 2 to 999999)

``BLD`` - Solve 1 puzzle blindfolded, you can't see the numbers after first move, confirm the solve by pressing ``Space``

> [!NOTE]  
> You can get averages of every solve type, even averages of marathons and relays.

> [!WARNING]  
> In BLD mode if you get DNF, your whole session (averages) is reset.

#### Display types

Specific fun changes to the way tiles work and look like. 

> [!NOTE]
> Display types are Not compatible with BLD solve type. 

> [!TIP]
> You can use ``Draw invisible tiles`` option to make some modes easier with mouse.

``Standard`` - normal puzzle

``Minimal`` - only the top left tile is visible

``Row minimal`` - only the top row is visible

``Fringe minimal`` - only the top row and left column are visible

``Inverse permutation`` - the inverse scramble is shown instead of the actual scramble

``Manhattan`` - each tile shows the manhattan distance away from solved (|x-solved_x|+|y-solved_y|)

``Vectors`` - each tile shows an arrow pointing to its solved position

``Incremental vectors`` - tile 1 points to tile 2, tile 2 points to tile 3, etc. and the last tile is blank

``Inverse vectors`` - inverse permutation + vectors

``RGB`` - red = correct row, blue = correct column, green = solved

``Chess`` - rook = correct row or column, bishop = correct diagonal, knight = a knight-move away from solved, king = solved

``Adjacent tiles`` - only the 2, 3 or 4 tiles adjacent to the blank are shown

``Adjacent sum`` - each tile shows the sum of the 2, 3 or 4 tiles adjacent to it

``Last move`` - only the last tile that moved is shown

``Fading tiles`` - when a tile is moved, its opacity will decrease, until it disappears after 2N moves on an NxN puzzle, or 2sqrt(NM) moves on an NxM puzzle

``Vanish on solved`` - once a tile is moved into its solved position, it will turn blank

``Minesweeper`` - the number on each tile is the number of solved adjacent tiles

``Minimal unsolved`` - the smallest-valued unsolved tile is shown, and all other tiles are hidden

``Maximal unsolved`` - the largest-valued unsolved tile is shown, and all other tiles are hidden

``Rows and columns`` - the number on each tile is the number of solved tiles in the same row or column

#### Custom scrambler

> [!IMPORTANT] 
> Please make sure it's set to ``Random permutation`` at all times, none of these except ``Random permutation`` is accepted on leaderboards.
>
> All other options here are for memes. You can experiment with them yourself if you like.

> [!CAUTION]
> ``Custom difficulty`` uses some obscure MD filters that may lag Slidysim a lot on very high settings.

### Controls

``Mouse`` - ``Hover`` - most common speedsolving control type, hover your mouse to control where blank tile goes.

> [!TIP]
> Holding ``CTRL`` or ``Any Mouse button`` will prevent any moves in Hover input mode.
>
> (This is very useful to setup mouse position before solve).

``Mouse`` - ``Click`` - useful mode for FMC, click on the tiles in same row or column as blank to move them.

``Keyboard`` - configure 4 keys to specify the moves of the tiles.

> [!WARNING]
> Avoid using keyboard if possible, it is considered objectively slower control type, compared to Hover for speedsolving.

> [!TIP]
> Common keybinds (ULDR) are:
> ben1996123: ``ijkf`` 
> vovker: ``isjd`` 
> dphdmn: ``arrow keys`` 

#### Advanced keyboard settings

If you hold ``Shift`` then it will do fast moves in the next direction you press. And while you're holding shift this will also apply to the opposite direction.

``Delay between repeated moves``, ``Delay until first repeated moves`` and ``Reset delay after direction change`` are configuring shift key delays accordingly.

``Keyboard+macros`` - Fast moves generated by Shift key are now instant. 

> [!WARNING]
> ``Keyboard+macros`` mode is NOT accepted for leaderboards.

### Animations

> [!IMPORTANT]
``Move duration`` - Please set that to ``0,000 seconds`` if you are using mouse hover controls.

On keyboard ``Move duration`` is actually playable, but still mostly used for memes.

``Scramble duration`` - Can be anything, does what it says.

## Solver

### Slidysim solver

In the regions text box, you can type each region on a new line, with a space between each tile number.

> [!TIP]
> You can also type something like "1-4" to include tiles 1, 2, 3 and 4. Select a preset from the dropdown box to see an example.

When you click load solver, the solver will generate a table which will allow it to optimally solve the tiles in that region, assuming all previous regions are already solved.

> [!IMPORTANT]
> Slidysim solver only solves Region optimally, not the whole puzzle.
>
> Very large regions may take Petabytes of memory and months to generate.

Once the solver has finished loading, you can scramble the puzzle, then click ``solve puzzle`` in the solver tab, then click ``apply solution`` to watch the solver solve the puzzle.

You can use batch solver tab to solve many scrambles at once, separated by a new line in appropriate format ``5 3 8 9/0 2 4 1/7 10 14 13/12 11 6 15``.

> [!CAUTION]
> Empty new lines or literally anything but scrambles in 100% correct format in ``Batch Solver`` can cause Slidysim to crash.

### Better solver options

Slidysim solver is impossible to make optimal for anything above 3x3, please use ``!solve`` command in [speedsliding](https://discord.gg/7vXrWAS3yZ) discord server or [Google Colab](https://colab.research.google.com/drive/1b6dcUESPMIfQx_ZFBU6KjcIPHSZ6pLa3?usp=sharing#forceEdit=true&sandboxMode=true) to solve 4x4 optimally.

> [!WARNING]
> Google Colab 4x4 solver is fast and good, but it has annoying bug, when sometimes it randomly produces All optimal solutions instead of just 1, keep that in mind when running many scrambles at once. Restarting the solver a few times usually fixes the bug and speeds up the process by a lot.

- For 5x5, 6x6, 7x7 puzzles you can use [AI solver](https://colab.research.google.com/drive/1wKP1NhUbj626KvxKxa3m37cW_0QUIKOj?usp=sharing#forceEdit=true&sandboxMode=true)

- For 8x8 you can use [Daanbe AI solver](https://colab.research.google.com/drive/1dbdqQZcOGxd9RLFnBADrmI2g6TcHsBDo?usp=sharing)

- You can also use [KNT](https://www.speedsolving.com/threads/kumi-na-tano-3-00-sliding-tile-puzzle-suboptimal-solver.38689/) for more advanced regions solver (also can do MTM).

- Fast [4x4 optimal solver](https://dphdmn.github.io/15puzzleSolver/) in JS (Slidysim format), also gives All optimal solutions for 1 scramble.

- [JS version of Daanbot](https://dphdmn.github.io/daanbotjs/) - JS implementation of famous Daanbot solver

> [!WARNING]
> Daanbot is NOT guaranteed to give optimal solutions, but can solve puzzles up to 10x10, do Grids, masked puzzles, custom MTM solutions etc.
>
> Daanbot requires some manual tuning of the variables, may Freeze page with wrong settings.
>
> For real (Python) version of Daanbot please ask in our [speedsliding](https://discord.gg/7vXrWAS3yZ) discord server.

## Multiplayer

> [!WARNING]
> Configuring Slidysim multiplayer is a rather annoying task, that requires opening ports on your PC or using external tools such as Radmin. Old's readme Multiplayer guide is rather outdated, and no one really uses Multiplayer nowadays, because features of it are quite limited and better be replaced with [discord](https://discord.gg/7vXrWAS3yZ) chat.

Ultimately, if you manage to open connection to your IP, you simply have to press ``Multiplayer -> Start server``, and share your IP with others to join. Make sure to open port ``1234`` when hosting.

**Features of multiplayer:** (in case someone actually hosts it)

- Basic chatbox window

- View laggy and buggy replays of other people solving

- You can also copy scrambles from other people

> [!TIP]
> ``/c 3`` in chat to start a 3s countdown in chat

> [!CAUTION]
> Slidysim multiplayer can crash your game due to random connection issues and bugs and you will Lose your session.

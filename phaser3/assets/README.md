# Aseprite

## Animation

1. Open the .aseprite file in Aseprite native app

2. Go to "File - Export Sprite Sheet"
 
3. On the **Layout** tab:

    a. Set the "Sheet type" to "Packed"

    b. Set the "Constraints" to "None"

    c. Check the "Merge Duplicates" checkbox
 
4. On the **Sprite** tab:

    a. Set "Layers" to "Visible layers"

    b. Set "Frames" to "All frames", unless you only wish to export a sub-set of tags
 
5. On the **Borders** tab:

    a. Check the "Trim Sprite" and "Trim Cells" options

    b. Ensure "Border Padding", "Spacing" and "Inner Padding" are all > 0 (1 is usually enough)
 
6. On the **Output** tab:

    a. Check "Output File", give your image a name and make sure you choose "png files" as the file type

    b. Check "JSON Data" and give your json file a name

    c. The JSON Data type can be either a Hash or Array, Phaser doesn't mind.

    d. Make sure "Tags" is checked in the Meta options

    e. In the "Item Filename" input box, make sure it says just "{frame}" and nothing more.
 
7. Click export

## Static Tiles

1. In Aseprite native app "File - Import Sprice Sheet"

    a. "Select File" the relevant .aseprite file

    b. "Width" = 128 and "Height" = 128

    c. Click import

2. Continue from step 2 above
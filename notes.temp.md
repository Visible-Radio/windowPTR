    next:
    perform initial layout based on documentSource passed to the constructor
    we can probably re-use our existing layout functions with some modifications
    but we'll need to be careful
    we want to be able to support animating individual characters
    so each character will have it's own state for determining which frame to render, and how to render the frame
    we also want to perform animations on entire words as well
    so our "parse" functions may be ok - they just turn the document string into a tree
    but we need to be deliberate about how we draw the tree to the screen

    a node with an animation attached to it needs access to the pixel information of all of it's children
    this is to support animating not just individual characters one by one
    but for animating entire words or blocks of text
    for instance, blinking them, scrambling them, etc

    we'll need to pick a strategy or strategies for resolving how these 'block' animations work.
    if individual characters have animations applied to them, do we run those first, and _then_ run the 'block' animation
    eg, if we draw a bunch of letters in sequence, but those letters belong to a node with a 'blink' animation
    when does the blink animation run?

    we could

    draw the letters in sequence
    once all the letters belonging to the node are drawn, transition to the block animation
    any single node that has an animation on it gets resolved one by one
    nodes would need access to pixel positions of all child nodes

    ignore the animation for the individual letters
    run only the 'parent' animation

    interleave the animations in some fashion

    interleaving might actually be the easiest

    nodes could 'report back' their pixel information for a given frame
    all the way to the root
    so the root node has the accumulated pixel information of all nodes for that frame
    as the accumulated value works it's way up, ancestor nodes apply their own transformations to the accumulated pixels from their child nodes

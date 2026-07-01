// Concrete / shape poem masks.
// Each shape is a hand-authored string-art silhouette: any non-space character
// marks a "filled" cell. Hand-authoring (rather than math predicates at low grid
// resolution) guarantees every shape reads as recognisable. Purely offline/static.

export const SHAPES = {
  heart: {
    name: 'Heart',
    icon: '💛',
    mask: [
      '   ####     ####   ',
      ' ######### ######### ',
      '####################',
      '####################',
      '####################',
      '####################',
      ' ################## ',
      '  ################  ',
      '   ##############   ',
      '    ############    ',
      '      ########      ',
      '       ######       ',
      '        ####        ',
      '         ##         ',
    ],
  },
  star: {
    name: 'Star',
    icon: '⭐',
    mask: [
      '         ##         ',
      '        ####        ',
      '        ####        ',
      '        ####        ',
      '####################',
      ' ################## ',
      '  ################  ',
      '   ##############   ',
      '   ##############   ',
      '  ######    ######  ',
      ' #####        ##### ',
      ' ####          #### ',
      '###              ###',
    ],
  },
  tree: {
    name: 'Tree',
    icon: '🌲',
    mask: [
      '         ##         ',
      '        ####        ',
      '       ######       ',
      '      ########      ',
      '        ####        ',
      '      ########      ',
      '     ##########     ',
      '    ############    ',
      '       ######       ',
      '     ##########     ',
      '    ############    ',
      '   ##############   ',
      '  ################  ',
      '        ####        ',
      '        ####        ',
      '        ####        ',
    ],
  },
  diamond: {
    name: 'Diamond',
    icon: '💎',
    mask: [
      '         ##         ',
      '        ####        ',
      '       ######       ',
      '      ########      ',
      '     ##########     ',
      '    ############    ',
      '   ##############   ',
      '  ################  ',
      '   ##############   ',
      '    ############    ',
      '     ##########     ',
      '      ########      ',
      '       ######       ',
      '        ####        ',
      '         ##         ',
    ],
  },
  circle: {
    name: 'Circle',
    icon: '⚪',
    mask: [
      '      ########      ',
      '   ##############   ',
      '  ################  ',
      ' ################## ',
      ' ################## ',
      '####################',
      '####################',
      '####################',
      '####################',
      ' ################## ',
      ' ################## ',
      '  ################  ',
      '   ##############   ',
      '      ########      ',
    ],
  },
  arrow: {
    name: 'Arrow',
    icon: '➤',
    mask: [
      '         ##         ',
      '         ####       ',
      '         ######     ',
      '         ########   ',
      '#####################',
      '#######################',
      '#####################',
      '         ########   ',
      '         ######     ',
      '         ####       ',
      '         ##         ',
    ],
  },
  wave: {
    name: 'Wave',
    icon: '🌊',
    mask: [
      '   ####                ####            ',
      '  ######              ######           ',
      ' ###  ####          ####  ###          ',
      '###    ####        ####    ###        #',
      '        ####      ####      ####      #',
      '         ####    ####        ####    ##',
      '          ##########          ########',
    ],
  },
  butterfly: {
    name: 'Butterfly',
    icon: '🦋',
    mask: [
      '####          ##          ####',
      '########      ##      ########',
      '###########   ##   ###########',
      '############# ## #############',
      '#############   #############',
      '############# ## #############',
      '###########   ##   ###########',
      '########      ##      ########',
      '####          ##          ####',
    ],
  },
};

// Collapse all whitespace out of the source so the silhouette fills solid
// (spaces would punch holes and wreck recognisability). Falls back to a default
// phrase when the user has not typed anything usable yet.
export function normaliseSource(text) {
  const cleaned = (text || '').replace(/\s+/g, '');
  return cleaned.length > 0 ? cleaned : 'writeyourpoemhere';
}

// Build the poem grid for a shape. Returns rows of { char, filled } plus a
// plain-text rendering (filled = char, empty = space) for copy/download.
export function buildPoem(text, shapeKey) {
  const shape = SHAPES[shapeKey] || SHAPES.heart;
  const source = normaliseSource(text);
  let i = 0;
  const rows = shape.mask.map((line) => {
    const cells = [];
    for (const ch of line) {
      if (ch === ' ') {
        cells.push({ char: ' ', filled: false });
      } else {
        cells.push({ char: source[i % source.length], filled: true });
        i += 1;
      }
    }
    return cells;
  });
  const plainText = rows
    .map((cells) => cells.map((c) => (c.filled ? c.char : ' ')).join('').replace(/\s+$/, ''))
    .join('\n');
  return { rows, plainText };
}

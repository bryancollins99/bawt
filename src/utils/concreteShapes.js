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

// Prepare the source characters that get flowed into the silhouette.
//   'solid' — collapse ALL whitespace so every filled cell holds a letter and
//             the shape reads at maximum density (best silhouette).
//   'words' — collapse runs of whitespace to a single space so the user's word
//             boundaries survive and the poem stays readable (spaces sit inside
//             the shape as small gaps rather than breaking its outline).
// Falls back to a default phrase when nothing usable has been typed yet.
export function normaliseSource(text, mode = 'solid') {
  if (mode === 'words') {
    const cleaned = (text || '').replace(/\s+/g, ' ').trim();
    return cleaned.length > 0 ? cleaned : 'write your poem here';
  }
  const cleaned = (text || '').replace(/\s+/g, '');
  return cleaned.length > 0 ? cleaned : 'writeyourpoemhere';
}

// Build the poem grid for a shape. Returns rows of { char, filled } plus a
// plain-text rendering (filled = char, empty = space) for copy/download.
// Rows are padded to a uniform width so the silhouette stays symmetric.
export function buildPoem(text, shapeKey, mode = 'solid') {
  const shape = SHAPES[shapeKey] || SHAPES.heart;
  const source = normaliseSource(text, mode);
  const width = Math.max(...shape.mask.map((line) => line.length));
  let i = 0;
  const rows = shape.mask.map((line) => {
    const padded = line.padEnd(width, ' ');
    const cells = [];
    for (const ch of padded) {
      if (ch === ' ') {
        cells.push({ char: ' ', filled: false });
      } else {
        // In 'words' mode a source space keeps the word boundary but leaves the
        // cell visually blank; the cell still counts as part of the silhouette.
        const srcChar = source[i % source.length];
        cells.push({ char: srcChar, filled: srcChar !== ' ' });
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

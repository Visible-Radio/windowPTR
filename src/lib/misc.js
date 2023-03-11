function breakWord(word, columns, broken = []) {
  // recursively break down a word that is too long
  if (word.length <= columns) {
    return [...broken, word];
  } else {
    return [
      ...broken,
      word.slice(0, columns),
      ...breakWord(word.slice(columns, word.length), columns, broken),
    ];
  }
}

function parseWords(text, columns) {
  return text.split(/(\s|\n)/).reduce((acc, w) => {
    const [trimmed, flags] = getFlags(w);
    if (!trimmed.length) return acc;
    const totalSegments = Math.ceil(trimmed.length / columns);
    const segments =
      totalSegments > 1 ? breakWord(trimmed, columns) : [trimmed];
    return [...acc, { fullWordText: trimmed, totalSegments, segments, flags }];
  }, []);
}

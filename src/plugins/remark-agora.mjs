// Renders the two content conventions of SPEC 4.1 in card bodies:
//   [^s3]               -> a superscript link to the card's source list (#src-s3)
//   :::assessment ... :::  -> an <aside class="assessment"> (the author's assessment, set apart from facts)
// Assessment blocks are single paragraphs in the content, so we match them at paragraph level.

const CITE = /\[\^(s\d+)\]/g;
const OPEN = /^:::assessment\s*\n?/;
const CLOSE = /\n?:::\s*$/;

function splitCitations(node) {
  if (!Array.isArray(node.children)) return;
  const out = [];
  for (const child of node.children) {
    if (child.type === 'text' && CITE.test(child.value)) {
      CITE.lastIndex = 0;
      let last = 0;
      for (const m of child.value.matchAll(CITE)) {
        if (m.index > last) out.push({ type: 'text', value: child.value.slice(last, m.index) });
        out.push({ type: 'html', value: `<sup class="cite"><a href="#src-${m[1]}">${m[1]}</a></sup>` });
        last = m.index + m[0].length;
      }
      if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) });
    } else {
      splitCitations(child);
      out.push(child);
    }
  }
  node.children = out;
}

function wrapAssessments(node) {
  if (!Array.isArray(node.children)) return;
  const out = [];
  for (const child of node.children) {
    const first = child.type === 'paragraph' && child.children[0];
    if (first && first.type === 'text' && OPEN.test(first.value)) {
      first.value = first.value.replace(OPEN, '');
      const lastChild = child.children[child.children.length - 1];
      if (lastChild.type === 'text') lastChild.value = lastChild.value.replace(CLOSE, '');
      out.push({ type: 'html', value: '<aside class="assessment"><span class="assessment-label">הערכה של כותב הכרטיס</span>' });
      out.push(child);
      out.push({ type: 'html', value: '</aside>' });
    } else {
      wrapAssessments(child);
      out.push(child);
    }
  }
  node.children = out;
}

export default function remarkAgora() {
  return (tree) => {
    wrapAssessments(tree);
    splitCitations(tree);
  };
}

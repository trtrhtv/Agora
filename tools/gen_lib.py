"""Helpers for writing content cards (works, guides, deepen lists) from Python.

Usage: sys.path.insert(0, 'tools'); from gen_lib import *
"""
import json, os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'content')
def q(s): return json.dumps(s, ensure_ascii=False)
def src_yaml(srcs):
    return ''.join(f"  - id: s{i+1}\n    title: {q(t)}\n    url: {u}\n    type: {ty}\n" for i,(t,u,ty) in enumerate(srcs))
def miss_yaml(m): return ''.join(f"    - {q(x)}\n" for x in m)
def lecture(id_, he, en, author, url, dur, year, series, body, srcs, missing, typ='lecture', lang='he', domains='[philosophy, politics]'):
    extra = f"series: {q(series)}\n" if series else ''
    open(f"{R}/works/{id_}.md","w").write(f"""---
id: {id_}
name_he: {q(he)}
name_en: {q(en)}
domains: {domains}
verification:
  status: partial
  missing:
{miss_yaml(missing)}  reviewed_by_me: false
  last_checked: 2026-10-16
sources:
{src_yaml(srcs)}type: {typ}
author: {author}
{extra}url: {url}
duration_min: {dur}
year: {year}
language: {lang}
availability: reference_only
---

## על היצירה

{body}
""")
def book(id_, he, en, author, year, lang, full_text, translations, body, srcs, missing, typ='book', domains='[politics, philosophy]'):
    tr=''.join(f"  - language: he\n    title: {q(t['title'])}\n    translator: {q(t['translator'])}\n"+(f"    publisher: {t['publisher']}\n" if t.get('publisher') else '')+f"    url: {t['url']}\n" for t in translations)
    open(f"{R}/works/{id_}.md","w").write(f"""---
id: {id_}
name_he: {q(he)}
name_en: {q(en)}
domains: {domains}
verification:
  status: partial
  missing:
{miss_yaml(missing)}  reviewed_by_me: false
  last_checked: 2026-10-16
sources:
{src_yaml(srcs)}type: {typ}
author: {author}
year: {year}
language: {lang}
availability: public_domain
full_text_url: {full_text}
translations:
{tr}---

{body}
""")
def guide(id_, he, en, domains, srcs, missing, weakest, affiliation, aff_url, expertise, langs, works, body):
    open(f"{R}/guides/{id_}.md","w").write(f"""---
id: {id_}
name_he: {he}
name_en: {en}
domains: {domains}
verification:
  status: partial
  missing:
{miss_yaml(missing)}  weakest_claims:
{miss_yaml(weakest)}  reviewed_by_me: false
  last_checked: 2026-10-16
sources:
{src_yaml(srcs)}affiliation: {q(affiliation)}
affiliation_url: {aff_url}
expertise: {q(expertise)}
languages: {langs}
works: [{', '.join(works)}]
---

{body}
""")
def add_works_to_guide(gid, ws):
    p=f"{R}/guides/{gid}.md"; s=open(p).read()
    import re
    m=re.search(r'^works: \[(.*)\]$', s, re.M)
    cur=[x.strip() for x in m.group(1).split(',') if x.strip()]
    for w in ws:
        if w not in cur: cur.append(w)
    s=s[:m.start()]+f"works: [{', '.join(cur)}]"+s[m.end():]
    s=s.replace('last_checked: 2026-10-15','last_checked: 2026-10-16')
    open(p,'w').write(s)
def deepen_yaml(items):
    out='deepen:\n'
    for it in items:
        if 'work' in it:
            out+=f"  - work: {q(it['work'])}\n    layer: {q(it['layer'])}\n    note_he: {q(it['note'])}\n"
        else:
            out+=f"  - title: {q(it['title'])}\n    by: {q(it['by'])}\n    type: {q(it['type'])}\n    language: {q(it['lang'])}\n"+(f"    year: {it['year']}\n" if it.get('year') else '')+f"    url: {q(it['url'])}\n    layer: {q(it['layer'])}\n    note_he: {q(it['note'])}\n"
        if it.get('endo'):
            out+=f"    endorsement:\n      by_he: {q(it['endo'][0])}\n      url: {it['endo'][1]}\n"
    return out
def set_deepen(thinker, items, key_works=None, fix_missing=None):
    p=f"{R}/thinkers/{thinker}.md"; s=open(p).read()
    head, body = s.split('\n---\n',1)
    import re
    head = re.sub(r'^deepen:\n(?:  .*\n?)*', '', head+'\n', flags=re.M).rstrip('\n')
    if key_works:
        if re.search(r'^key_works:', head, re.M): head=re.sub(r'^key_works:.*$', f"key_works: [{', '.join(key_works)}]", head, flags=re.M)
        else: head+=f"\nkey_works: [{', '.join(key_works)}]"
    if fix_missing:
        for old,new in fix_missing:
            assert old in head, (thinker, old); head=head.replace(old,new)
    head=head.replace('reviewed_by_me: true','reviewed_by_me: false')
    head+='\n'+deepen_yaml(items).rstrip('\n')
    open(p,'w').write(head+'\n---\n'+body)

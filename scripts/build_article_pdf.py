#!/usr/bin/env python3
"""Render content/articles/can-you-go-48-0.md to a print-ready PDF.

Deps (not part of the app):  pip install markdown reportlab
Run:  python3 scripts/build_article_pdf.py
"""
import os
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem,
)

SRC = os.path.join(_ROOT, "content/articles/can-you-go-48-0.md")
OUT = os.path.join(_ROOT, "content/articles/can-you-go-48-0.pdf")

LIB = "/usr/share/fonts/truetype/liberation/"
DEJ = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("Body", LIB + "LiberationSerif-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Body-B", LIB + "LiberationSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Body-I", LIB + "LiberationSerif-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Sans", LIB + "LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Sans-B", LIB + "LiberationSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Mono", DEJ + "DejaVuSansMono.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("Body", normal="Body", bold="Body-B", italic="Body-I", boldItalic="Body-B")

FLAME = HexColor("#FF4D00")
FLAME_L = HexColor("#FFA132")
LINK = HexColor("#D23A00")
INK = HexColor("#0B0A09")
GREY = HexColor("#6B645F")

raw = open(SRC, encoding="utf-8").read()
m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
front, body = (m.group(1), m.group(2)) if m else ("", raw)


def fm(key, default=""):
    mm = re.search(rf'^{key}:\s*"?(.*?)"?\s*$', front, re.M)
    return mm.group(1) if mm else default


author, date, reading, link = fm("author", "Ian Silva"), fm("date"), fm("readingTime"), fm("canonical")
emoji = re.compile("[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF←-⇿⬀-⯿️]")


def inline(text):
    text = emoji.sub("", text).strip()
    links = []
    def stash(mm):
        links.append((mm.group(1), mm.group(2)))
        return f"\x00{len(links)-1}\x00"
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", stash, text)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"`(.+?)`", r'<font face="Mono" size=9>\1</font>', text)
    text = re.sub(r"(?<![\"\x00>])(https?://[^\s)]+)",
                  r'<a href="\1"><font color="#D23A00">\1</font></a>', text)
    def restore(mm):
        t, u = links[int(mm.group(1))]
        t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        return f'<a href="{u}"><font color="#D23A00">{t}</font></a>'
    text = re.sub(r"\x00(\d+)\x00", restore, text)
    return re.sub(r"\s{2,}", " ", text).strip()


st_h1 = ParagraphStyle("h1", fontName="Sans-B", fontSize=27, leading=30, textColor=INK,
                       spaceBefore=2, spaceAfter=4)
st_h2 = ParagraphStyle("h2", fontName="Sans-B", fontSize=15, leading=19, textColor=INK,
                       spaceBefore=16, spaceAfter=6, borderColor=FLAME, leftIndent=10,
                       borderWidth=0)
st_h3 = ParagraphStyle("h3", fontName="Sans-B", fontSize=12, leading=16, textColor=INK,
                       spaceBefore=12, spaceAfter=4)
st_p = ParagraphStyle("p", fontName="Body", fontSize=11.5, leading=17, textColor=HexColor("#16110E"),
                      spaceAfter=8, alignment=TA_LEFT)
st_li = ParagraphStyle("li", parent=st_p, spaceAfter=4)
st_quote = ParagraphStyle("q", parent=st_p, fontName="Body-I", textColor=HexColor("#423C37"),
                          leftIndent=14, borderColor=FLAME_L, spaceBefore=2, spaceAfter=10)
st_kick = ParagraphStyle("k", fontName="Mono", fontSize=8.5, leading=12, textColor=FLAME,
                         spaceAfter=4)
st_by = ParagraphStyle("by", fontName="Sans", fontSize=9.5, leading=13, textColor=GREY)
st_foot = ParagraphStyle("ft", fontName="Sans", fontSize=9, leading=13, textColor=GREY)


class H2(Paragraph):
    """h2 with a flame accent bar drawn on the left."""
    def draw(self):
        Paragraph.draw(self)
        self.canv.setFillColor(FLAME)
        self.canv.rect(-10, -2, 4, self.height + 2, fill=1, stroke=0)


flow = []
flow.append(Paragraph("Perfect Run &middot; Unofficial World Cup Draft Game", st_kick))
months = "January February March April May June July August September October November December".split()
try:
    y, mo, d = (int(x) for x in date.split("-"))
    nice = f"{d} {months[mo-1]} {y}"
except Exception:
    nice = date
flow.append(Paragraph(" &middot; ".join(x for x in [f"By {author}", nice, reading] if x), st_by))
flow.append(Spacer(1, 8))
flow.append(HRFlowable(width="100%", thickness=3, color=FLAME, lineCap="round", spaceAfter=18))

lines = body.split("\n")
i = 0
bullets = None  # (ordered, items)


def flush_bullets():
    global bullets
    if not bullets:
        return
    ordered, items = bullets
    flow.append(ListFlowable(
        [ListItem(Paragraph(inline(it), st_li), leftIndent=14,
                  value=(n + 1) if ordered else None) for n, it in enumerate(items)],
        bulletType="1" if ordered else "bullet",
        bulletColor=FLAME, start="1" if ordered else None,
        leftIndent=12, bulletFontName="Sans",
    ))
    flow.append(Spacer(1, 4))
    bullets = None


while i < len(lines):
    line = lines[i].rstrip()
    s = line.strip()
    if not s:
        flush_bullets()
        i += 1
        continue
    if s.startswith("# "):
        flush_bullets(); flow.append(Paragraph(inline(s[2:]), st_h1))
    elif s.startswith("## "):
        flush_bullets(); flow.append(H2(inline(s[3:]), st_h2))
    elif s.startswith("### "):
        flush_bullets(); flow.append(Paragraph(inline(s[4:]), st_h3))
    elif s in ("---", "***", "___"):
        flush_bullets(); flow.append(HRFlowable(width="100%", thickness=0.6,
                                                color=HexColor("#E3DDD3"), spaceBefore=8, spaceAfter=14))
    elif re.match(r"^\d+\.\s+", s):
        if not bullets or not bullets[0]:
            flush_bullets(); bullets = (True, [])
        bullets[1].append(re.sub(r"^\d+\.\s+", "", s))
    elif s.startswith("- ") or s.startswith("* "):
        if not bullets or bullets[0]:
            flush_bullets(); bullets = (False, [])
        bullets[1].append(s[2:])
    elif s.startswith("> "):
        flush_bullets()
        q = [s[2:]]
        while i + 1 < len(lines) and lines[i + 1].strip().startswith("> "):
            i += 1; q.append(lines[i].strip()[2:])
        flow.append(Paragraph(inline(" ".join(q)), st_quote))
    else:
        flush_bullets()
        para = [s]
        while i + 1 < len(lines) and lines[i + 1].strip() and not re.match(
                r"^(#|-|\*|>|\d+\.)\s", lines[i + 1].strip()) and lines[i + 1].strip() not in ("---",):
            i += 1; para.append(lines[i].strip())
        flow.append(Paragraph(inline(" ".join(para)), st_p))
    i += 1
flush_bullets()

flow.append(Spacer(1, 16))
flow.append(HRFlowable(width="100%", thickness=0.6, color=HexColor("#E3DDD3"), spaceAfter=10))
flow.append(Paragraph(
    f"Built by the <b>PLYAZ team</b>. Play free at "
    f'<a href="{link}"><font color="#D23A00">{link}</font></a>. '
    "Unofficial fan project — not affiliated with FIFA or any federation.", st_foot))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=18 * mm,
                        title=fm("title"), author=author)
doc.build(flow)
print("wrote", OUT)

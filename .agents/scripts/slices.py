import fitz
doc = fitz.open("attached_assets/MVP_Studio_for_Founders_Start_Apps_Studio_2_1786236286900.pdf")
page = doc[0]
H = 14400; W = 402; n = 12
for i in range(n):
    clip = fitz.Rect(0, i*H/n, W, (i+1)*H/n)
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5,1.5), clip=clip)
    pix.save(f".agents/outputs/slice_{i:02d}.png")
print("done")

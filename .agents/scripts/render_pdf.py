import fitz
doc = fitz.open("attached_assets/MVP_Studio_for_Founders_Start_Apps_Studio_2_1786236286900.pdf")
print("pages:", doc.page_count)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.6,1.6))
    pix.save(f".agents/outputs/pdfpage_{i+1}.png")
    print(i+1, page.rect)

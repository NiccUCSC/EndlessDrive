from PIL import Image
import sys

def createExtruded(input, output):
    image = Image.open(input)
    pixels = image.load()
    width, height = image.size

    tileWidth = width // 16
    tileHeight = height // 16
    padding = 1

    newWidth = (16+2)*tileWidth
    newHeight = (16+2)*tileHeight

    extrudedImage = Image.new('RGB', (newWidth, newHeight), color=(255, 255, 255))
    newPixels = extrudedImage.load()

    print(extrudedImage.size)
    print(tileWidth)
    print(tileHeight)

    for tx in range(tileWidth):                     # tile x
        for ty in range(tileHeight):                # tile y
            for ntx in range(16+2):                 # relative new tile x
                for nty in range(16+2):             # relative new tile y
                    stx = min(max(ntx-1, 0), 15)    # relative source tile x
                    sty = min(max(nty-1, 0), 15)    # relative source tile y
                    
                    sx = stx + 16 * tx              # absolute source x
                    sy = sty + 16 * ty              # absolute source y
                    nx = ntx + 18 * tx              # absolute new x
                    ny = nty + 18 * ty              # absolute new y


                    newPixels[nx, ny] = pixels[sx, sy]

    extrudedImage.save(output)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_image_path> <output_image_path>")
        sys.exit(1)

    input_image_path = sys.argv[1]
    output_image_path = sys.argv[2]

    createExtruded(input_image_path, output_image_path)
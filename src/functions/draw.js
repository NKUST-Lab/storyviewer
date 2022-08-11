
//繪製底圖
export function drawBackgroundImage(ctx, data) {
    const img = new Image();
    img.src = data.page_photo_url;
    return (
        new Promise((resolve) => {
            img.addEventListener("load", () => {
                ctx.drawImage(img, 0, 0, img.width, img.height);
                resolve();
            })
            img.onerror = () => {
                console.warn("background image load failed")
            }
        })
    )
}

//繪製文字
export function drawText(ctx, data) {
    if (data.text == undefined) return
    for (let i = 0; i < data.text.length; i++) {
        const text = data.text[i];
        const rictWidth = parseInt(text.rect.split(",")[0]);
        const rictHeight = parseInt(text.rect.split(",")[1]);
        const locationX = parseInt(text.location.split(",")[0]);
        const locationY = parseInt(text.location.split(",")[1]);
        const text_context = text.book_text;
        //設置字型及大小
        ctx.font = `${text.text_size}px Chalkboard SE Light`;
        ctx.fillStyle = text.text_color;
        //設置陰影
        if (text.shadow === 1) {
            ctx.shadowColor = text.shadow_color;
            ctx.shadowOffsetX = text.shadow;
            ctx.shadowOffsetY = text.shadow;
        }
        //設定對齊
        switch (text.alignment) {
            case 0:
                ctx.textAlign = 'center'
                break;
            case 1:
                ctx.textAlign = 'left'
                break;
            case 2:
                ctx.textAlign = 'right'
                break;
        }
        //設定旋轉
        ctx.save();
        if (text.rotate !== 0) ctx.rotate(text.rotate * Math.PI / 180);
        wrapText(ctx, text_context, locationX, locationY + text.text_size * 1.16, rictWidth, text.text_size * 1.16);
        if (text.rotate !== 0) ctx.restore()
        // ctx.fillText(text_context, locationX, locationY, rictWidth);
    }
}

//繪製角色
export async function drawCharacter(ctx, data) {
    if (data.character == undefined) return
    for (let i = 0; i < data.character.length; i++) {
        const character = data.character[i];
        await drawThings(ctx, character.source_url, character.source_size || 100, character.source_location);
    }
}

//繪製配件
export async function drawAccessories(ctx, data) {
    if (data.accessories == undefined) return
    for (let i = 0; i < data.accessories.length; i++) {
        const accessory = data.accessories[i];
        await drawThings(ctx, accessory.accessory_url, accessory.size, accessory.location);
    }
}

//圖形繪製
function drawThings(ctx, src, size, location) {
    const img = new Image();
    img.src = src; //設定URL
    const percentagesize = size / 100; //設定Size
    const locationX = parseInt(location.split(",")[0]); //設定X位置
    const locationY = parseInt(location.split(",")[1]); //設定Y位置
    return (
        new Promise((resolve) => {
            img.addEventListener("load", () => {
                const resizeWidth = img.width * percentagesize;
                const resizeHeight = img.height * percentagesize;
                ctx.drawImage(img, locationX - resizeWidth / 2, locationY - resizeHeight / 2, resizeWidth, resizeHeight);
                resolve();
            })
            img.onerror = () => {
                console.warn(`draw things error occured`);
                console.warn(`error url ${img.src}`);
                resolve();
            }
        })
    )
}

//會自動換行的fillText
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.trim().split(' ');
    let line = '';
    console.log(`words${words}`)
    for (let [index, w] of words.entries()) {
        ctx.font = w.substring(0, 2) === "##" && w.slice(-2) === "##" ? `bold ${ctx.font}` : ctx.font;
        w = w.substring(0, 2) === "##" && w.slice(-2) === "##" ? w.substring(2, w.length - 1) : w
        const testLine = line + w + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && index > 0) {
            ctx.fillText(line, x, y);
            line = w + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}
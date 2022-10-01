import wrapText from "./drawtext";

//繪製底圖
export function drawBackgroundImage(ctx, data) {
    const img = new Image();
    img.src = data.page_photo_url;
    img.crossOrigin = "anonymous" //設定後才能轉成圖片
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
export function drawText(ctx, data, isCustomFace) {
    if (data.text == undefined) return
    return Promise.all(
        data.text.map(text => {
            const rictWidth = parseInt(text.rect.split(",")[0]);
            const rictHeight = parseInt(text.rect.split(",")[1]);
            const locationX = parseInt(text.location.split(",")[0]);
            const locationY = parseInt(text.location.split(",")[1]);
            ctx.fillStyle = text.text_color;
            //設置陰影
            if (text.shadow !== 0) {
                ctx.shadowColor = text.shadow_color;
                ctx.shadowOffsetX = text.shadow;
                ctx.shadowOffsetY = text.shadow;
            }
            //設定對齊
            let re_positionedX = locationX
            let text_alignment = 'left'
            switch (text.alignment) {
                case 0:
                    text_alignment = 'center'
                    re_positionedX = locationX
                    break;
                case 1:
                    text_alignment = 'left'
                    re_positionedX = locationX
                    break;
                case 2:
                    text_alignment = 'right'
                    re_positionedX = locationX + rictWidth
                    break;
            }
            ctx.textAlign = 'left'
            //設定旋轉
            ctx.save();
            if (text.rotate !== 0) ctx.rotate(text.rotate * Math.PI / 180);
            const lineheight =  text.text_size * 1.16
            wrapText(ctx, text, re_positionedX, 
                locationY + lineheight, 
                rictWidth, lineheight, 
                data.book_characters, isCustomFace,
                text_alignment);
            if (text.rotate !== 0) ctx.restore()
        })
    )

}

//繪製角色
export async function drawCharacter(ctx, data, isCustomFace) {
    if (data.character == undefined) return
    console.log("Doing draw iscustomface is ", isCustomFace)
    return new Promise(async(resolve) => {
        for (const character of data.character) {
            await drawThings(ctx, character.source_url, 
                isCustomFace ? character.size : 100, 
                isCustomFace ? character.location : character.source_location,
                isCustomFace ? character.rotate : 0,
                isCustomFace);
        }
        resolve()
    })
}

//繪製配件
export async function drawAccessories(ctx, data) {
    if (data.accessories == undefined) return
    return new Promise(async(resolve) => {
        for (const accessory of data.accessories) {
            await drawThings(ctx, accessory.accessory_url, accessory.size, accessory.location, accessory.rotate, true);
        }
        resolve()
    })
}

//圖形繪製
function drawThings(ctx, src, size, location, rotate, isCustomface = false) {
    const img = new Image();
    img.src = src; //設定URL
    img.crossOrigin = "anonymous" //設定後才能轉成圖片
    const percentagesize = size / 100; //設定Size
    const locationX = parseInt(location.split(",")[0]); //設定X位置
    const locationY = parseInt(location.split(",")[1]); //設定Y位置
    return (
        new Promise((resolve) => {
            img.addEventListener("load", () => {
                const resizeWidth = img.width * percentagesize;
                const resizeHeight = img.height * percentagesize;
                ctx.save();
                //設定旋轉
                if (rotate !== 0) ctx.translate(locationX, locationY);
                if (rotate !== 0) ctx.rotate(rotate * Math.PI / 180);
                //如為換臉模式 且圖形需要旋轉 則需要在不同的座標位置繪畫
                if (rotate !== 0 && isCustomface) {
                    ctx.drawImage(img, -resizeWidth / 2 , -resizeHeight / 2 ,resizeWidth, resizeHeight);
                } else{
                    ctx.drawImage(img, locationX - resizeWidth / 2, locationY - resizeHeight / 2, resizeWidth, resizeHeight);
                }  
                ctx.restore()
                resolve();
            })
            img.onerror = () => {
                console.warn(`draw things error occured`);
                resolve();
            }
        })
    )
}

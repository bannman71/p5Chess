class Coords{
    static x;
    static y;    
}

export default class Front {

    constructor(spacing, blockSize, pieceScale, images){ 
        this.black = 'rgb(140,162,173)';
        this.white = 'rgb(222,237,230)';
        

        this.spacing = spacing;
        this.blockSize = blockSize;
        this.pieceScale = pieceScale;
        this.images = images;

    }
 

    getMouseCoord(x,y){
        Coords.x = Math.floor(x / this.blockSize);
        Coords.y = Math.floor(y / this.blockSize);

        return Coords;
    }

    getPieceAtMousepos(occSquares,x,y){
        x = Math.floor(x / this.blockSize);
        y = Math.floor(y / this.blockSize);

        if ((x < 8 && x >= 0) && (y < 8 && y >= 0))  return occSquares[y][x];
        else return undefined;
    }

    drawPieceAtMousepos(piece, x, y, p5){

        x -= this.blockSize * this.pieceScale / 2;  // centers piece
        y -= this.blockSize * this.pieceScale / 2;

        if (piece !== 0){
            
            let piece_number = piece.colourAndPiece();

            p5.image(this.images[piece_number], 
            Math.min(width - this.blockSize + this.spacing, Math.max(this.spacing, x)), 
            Math.min(height - this.blockSize + this.spacing, Math.max(this.spacing, y)), this.blockSize * this.pieceScale, this.blockSize * this.pieceScale);
        }
    }

    draw_piece(piece,coordX,coordY, p5){
        coordX = this.spacing + coordX * this.blockSize;
        coordY = this.spacing + coordY * this.blockSize;

        p5.image(this.images[piece],coordX,coordY, this.blockSize * this.pieceScale, this.blockSize * this.pieceScale);
        
    }

    draw_grid(){

    }

    drawAllPieces(occSquares,pieceAtMouse, p5){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (occSquares[i][j] !== 0){
                    if (pieceAtMouse !== occSquares[i][j]) this.draw_piece(occSquares[i][j].colourAndPiece(), j, i, p5);
                }
            }
        }
    }

    drawLegalSquares(squares, p5){
        let row;
        let col;

        for (let i = 0; i < squares.length; i++){
            row = (this.blockSize / 2) + squares[i][0] * this.blockSize;
            col =  (this.blockSize/2) + squares[i][1] * this.blockSize;
            p5.fill(80,123,101, 175);
            p5.ellipse(col,row,this.blockSize * 0.25);
        }
        
    }

}
class Coords{
    static x;
    static y;    
}

export default class Front {

    constructor(){ 
        this.black = 'rgb(140,162,173)';
        this.white = 'rgb(222,237,230)';
        this.BIN_PIECES = {
        20: 'b_bishop', 17: 'b_king', 19: 'b_knight', 18: 'b_pawn', 22: 'b_queen', 21: 'b_rook',
        12: 'w_bishop', 9: 'w_king', 11: 'w_knight', 10: 'w_pawn', 14: 'w_queen', 13: 'w_rook'}

    }
 

    getMouseCoord(x,y){
        Coords.x = Math.floor(x / BLOCK_SIZE);
        Coords.y = Math.floor(y / BLOCK_SIZE);

        return Coords;
    }

    getPieceAtMousepos(occSquares,x,y){
        x = Math.floor(x / BLOCK_SIZE);
        y = Math.floor(y / BLOCK_SIZE);

        if ((x < 8 && x >= 0) && (y < 8 && y >= 0))  return occSquares[y][x];
        else return undefined;
    }

    drawPieceAtMousepos(piece, x, y){

        x -= BLOCK_SIZE * PIECE_SCALE / 2;  // centers piece
        y -= BLOCK_SIZE * PIECE_SCALE / 2;

        if (piece !== 0){
            
            let piece_number = piece.colourAndPiece();

            p5.image(IMAGES[piece_number], 
            Math.min(width - BLOCK_SIZE + SPACING, Math.max(SPACING, x)), 
            Math.min(height - BLOCK_SIZE + SPACING, Math.max(SPACING, y)), BLOCK_SIZE * PIECE_SCALE, BLOCK_SIZE * PIECE_SCALE);
        }
    }

    draw_piece(piece,coordX,coordY){
        coordX = SPACING + coordX * BLOCK_SIZE;
        coordY = SPACING + coordY * BLOCK_SIZE;

        p5.image(IMAGES[piece],coordX,coordY, BLOCK_SIZE * PIECE_SCALE, BLOCK_SIZE * PIECE_SCALE);
        
    }

    draw_grid(){

    }

    drawAllPieces(occSquares,pieceAtMouse){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (occSquares[i][j] !== 0){
                    if (pieceAtMouse !== occSquares[i][j]) draw_piece(occSquares[i][j].colourAndPiece(), j, i);
                }
            }
        }
    }

    drawLegalSquares(squares){
        let row;
        let col;

        for (let i = 0; i < squares.length; i++){
            row = (BLOCK_SIZE / 2) + squares[i][0] * BLOCK_SIZE;
            col =  (BLOCK_SIZE/2) + squares[i][1] * BLOCK_SIZE;
            p5.fill(80,123,101, 175);
            p5.ellipse(col,row,BLOCK_SIZE * 0.25);
        }
        
    }

}
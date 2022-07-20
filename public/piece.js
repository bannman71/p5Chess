
class PieceType{

    static type = {
        'k': 1, 'p' : 2, 'n' : 3, 'b': 4, 'r': 5, 'q': 6,
        'K': 1, 'P' : 2, 'N' : 3, 'B': 4, 'R': 5, 'Q': 6 
    }

    static none = 0;
    static king = 1;
    static pawn = 2
    static knight = 3
    static bishop = 4
    static rook = 5
    static queen = 6
    
    static white = 8
    static black = 16
}



class Piece{

    constructor(pieceType, row, col, colour){
        this.pieceType = pieceType;
        this.row = row;
        this.col = col;
        this.colour = colour;
    }

    colourAndPiece(){
        return this.colour ^ this.pieceType;
    }

    isLegal(destRow,destCol){
        const rankFileIntervals = [
            {dx: 1,dy: 0}, 
            {dx: -1,dy: 0}, 
            {dx: 0,dy: 1}, 
            {dx: 0,dy: -1}
        ]
        const diagIntervals = [
            {dx: 1, dy: 1},
            {dx: -1, dy : -1},
            {dx: 1, dy: -1},
            {dx: -1, dy: 1}
        ]
        
        if (this.row === destRow && this.col === destCol){
            return false;
        }

        if (this.pieceType === PieceType.rook){
            if ([destRow,destCol] in this.legal_squares(this.row,this.col,rankFileIntervals)) return true;
        }

    }

    is_on_board(Row,Col){
        if (Row >= 0 && Row < 8 && Col >= 0 && Col < 8){
            return true;
        }
        return false;
    }

    legal_squares(row,col,intervals){
        var legalCoords = [];

        for (let options of intervals){
            var col_temp =  col + options.dx;
            var row_temp = row + options.dy;

            while(this.is_on_board(row_temp,col_temp)){ //while hasn't gone outside of the array
                if (occupiedSquares[row_temp][col_temp] === 0){
                    legalCoords.push([row_temp,col_temp]);
                }
                else{
                    if ((occupiedSquares[row_temp][col_temp] & this.colour) === 0){ // opposite colours
                        legalCoords.push([row_temp,col_temp]);
                    }
                    break;
                } 
                col_temp += options.dx;
                row_temp += options.dy;
            }
        }
        return legalCoords;
    }


}
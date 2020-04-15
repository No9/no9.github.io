function SyncRuleSet(field, maxX, maxY) {
    this.field = field;
    this.maxX = maxX;
    this.maxY = maxY;
    for (x = 0; x < this.maxX; x++) {
        for (y = 0; y < this.maxY; y++) {
            var rgbVal = field[x][y].shade = getRandRGB();
            field[x][y].color = "rgb(" + rgbVal + "," + rgbVal + "," + rgbVal + ")";
            field[x][y].state = getRandBinary();
        }
    }
}

SyncRuleSet.prototype.pumpNeighbours = pumpNeighbours;
SyncRuleSet.prototype.tick = tick;
SyncRuleSet.prototype.tickAlgorithm = tickAlgorithm;

function getRandBinary() {
    return Math.floor(Math.random() * 2);
}

function getRandRGB(){
    return Math.floor(Math.random()*256);
}


function pumpNeighbours(x, y)
{
    console.log('Fire pumpNeighbours')
    var inc = 28;
    // Returns the number of neighbors for a specific coordinate.
    if (x + 1 < this.maxX && this.field[x + 1][y].shade != -1)
    {
        this.field[x + 1][y].shade += inc; 
    }
    
    if (x - 1 >= 0 && this.field[x - 1][y].shade != -1)
    {
        this.field[x - 1][y].shade += inc;
    }

    if (y + 1 < this.maxY && this.field[x][y + 1].shade != -1)
    {
        this.field[x][y + 1].shade += inc;
    }

    if (y - 1 >= 0 && this.field[x][y - 1].shade != -1)
    {
        this.field[x][y - 1].shade += inc;
    }

    // diaganols
    if (x + 1 < this.maxX && y + 1 < this.maxY && this.field[x + 1][y + 1].shade != -1)
    {
        this.field[x + 1][y + 1].shade += inc;
    }
    
    if (x + 1 < this.maxX && y - 1 >= 0 && this.field[x + 1][y - 1].shade != -1)
    {
        this.field[x + 1][y - 1].shade += inc;
    }

    if (x - 1 >= 0 && y + 1 < this.maxY && this.field[x - 1][y + 1].shade != -1)
    {
        this.field[x - 1][y + 1].shade += inc;
    }

    if (x - 1 >= 0 && y - 1 >= 0 && this.field[x - 1][y - 1].shade != -1)
    {
        this.field[x - 1][y - 1].shade += inc;
    }
}

        function tick() {
        
            var field2 = this.tickAlgorithm();
            this.field = field2.slice(0);
        }

        function tickAlgorithm() {
        
            for ( y = 0; y < this.maxY; y++)
            {
                for ( x = 0; x < this.maxX; x++)
                {
                    // neighbors = this.getNumberOfNeighbors(x, y);
                    currentshadeinc =  Math.round(Math.abs((this.field[x][y].shade / 32) - 32));
                    this.field[x][y].shade = this.field[x][y].shade + currentshadeinc;
                    var rgbVal = Math.abs(this.field[x][y].shade - 256) ;

                    console.log(rgbVal);
                    this.field[x][y].color = "rgb(" + rgbVal + "," + rgbVal + "," + rgbVal + ")";
                    
                    if(this.field[x][y].shade > 254)
                    {
                        this.field[x][y].color = "rgb(255,255,255)";
                        this.field[x][y].shade = -1;   
                        this.pumpNeighbours(x, y);                       
                    }



                    /*
                    if (neighbors == 3)
                    {
                        // cell is born.
                        field2[x][y].state = 1;
                        field2[x][y].color = "rgb(277, 193, 58)"
                        continue;
                    }

                    if (neighbors == 2 || neighbors == 3)
                    {
                        // cell continues.
                        field2[x][y].state = this.field[x][y].state;
                        field2[x][y].color = this.field[x][y].color;
                        continue;
                    }

                    // cell dies.
                    field2[x][y].state = 0;
                    field2[x][y].color = "rgb(0, 0, 0)"
                    */
                }
            }
            return this.field;
        }
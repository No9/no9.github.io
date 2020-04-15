function RuleSet(field, maxX, maxY) {
    this.field = field;
    this.maxX = maxX;
    this.maxY = maxY;
    for (x = 0; x < this.maxX; x++) {
        for (y = 0; y < this.maxY; y++) {
            field[x][y].state = getRandBinary();
        }
    }
}
RuleSet.prototype.getNumberOfNeighbors = getNumberOfNeighbors;
RuleSet.prototype.tick = tick;
RuleSet.prototype.tickAlgorithm = tickAlgorithm;
        function getRandBinary() {
            return Math.floor(Math.random() * 2);
        }


function getNumberOfNeighbors(x, y)
        {
            // Returns the number of neighbors for a specific coordinate.
           var neighbors = 0;

            if (x + 1 < this.maxX && this.field[x + 1][y].state == 1)
            {
                neighbors++;
            }

            if (x - 1 >= 0 && this.field[x - 1][y].state == 1)
            {
                neighbors++;field2[x][y].color = "rgb(0, 0, 0)"
            }

            if (y + 1 < this.maxY && this.field[x][y + 1].state == 1)
            {
                neighbors++;
            }

            if (y - 1 >= 0 && this.field[x][y - 1].state == 1)
            {
                neighbors++;
            }

            // diaganols
            if (x + 1 < this.maxX && y + 1 < this.maxY && this.field[x + 1][y + 1].state == 1)
            {
                neighbors++;
            }

            if (x + 1 < this.maxX && y - 1 >= 0 && this.field[x + 1][y - 1].state == 1)
            {
                neighbors++;
            }

            if (x - 1 >= 0 && y + 1 < this.maxY && this.field[x - 1][y + 1].state == 1)
            {
                neighbors++;
            }

            if (x - 1 >= 0 && y - 1 >= 0 && this.field[x - 1][y - 1].state == 1)
            {
                neighbors++;
            }

            return neighbors;
        }

        function tick() {
        
            var field2 = this.tickAlgorithm();
            this.field = field2.slice(0);
        }

        function tickAlgorithm() {
        
            field2 = new SiteList(this.maxX, this.maxY);

            // 23/3 - Conway's Game of Life
            // The first number(s) is what is required for a cell to continue.
            // The second number(s) is the requirement for birth.
            for ( y = 0; y < this.maxY; y++)
            {
                for ( x = 0; x < this.maxX; x++)
                {
                     neighbors = this.getNumberOfNeighbors(x, y);
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
                }
            }

            return field2;
        
        }


        function ConwaysGameOfLife(field, maxX, maxY) {
            this.field = field;
            this.maxX = maxX;
            this.maxY = maxY;
            ConwaysGameOfLife.prototype = RuleSet(field, maxX, maxY);
        }
function Lattice(tableSize, canvas) {
            {
                this.siteList = new SiteList(tableSize, tableSize, 4, this);
                this.tableSize = tableSize;
                this.canvas = canvas;
                this.criticalValue = 4;
                
            }

            Lattice.prototype.paintCanvas = paintCanvas;
            Lattice.prototype.addNewGrain = grainAdded;



            function paintCanvas() {

                var elem = this.canvas;
                if (elem && elem.getContext) {
                    // Get the 2d context.
                    // Remember: you can only initialize one context per element.
                    var context = elem.getContext('2d');
                    if (context) {
                        ////context.fillRect(100, 100, 100, 100);
                        for (iRowCounter = 0; iRowCounter < this.tableSize; iRowCounter++) {
                            for (iColCounter = 0; iColCounter < this.tableSize; iColCounter++) {
                                    var size = this.siteList[iRowCounter][iColCounter].width / 2
                                    context.fillStyle = this.siteList[iRowCounter][iColCounter].color; // "#e3c13a";
                                    context.beginPath();
                                    context.arc(this.siteList[iRowCounter][iColCounter].left + size, this.siteList[iRowCounter][iColCounter].top + size, size, 0, Math.PI * 2, true);
                                    context.closePath();
                                    context.stroke();
                                    context.fill();
                            } //End of col loop
                        } //End of row loop
                    } //End of if context
                } //End of if element
            }
        }

        function Site(criticalValue, lattice) {
            this.criticalValue = criticalValue;
            this.lattice = lattice;
            this.left = 0;
            this.top = 0
            this.width = 0;
            this.height = 0;
            this.row;
            this.column;
            this.state = 0;
            this.color = "rgb(0, 0, 0)";
            this.shade = 0;
        }

        function SiteList(iRows, iCols, criticalVal, lattice) {
            var iRowCounter;
            var iColCounter;
            var a = new Array(iRows);
            for (iRowCounter = 0; iRowCounter < iRows; iRowCounter++) {
                a[iRowCounter] = new Array(iCols);
                for (iColCounter = 0; iColCounter < iCols; iColCounter++) {

                    var site = new Site(criticalVal, lattice);
                    site.row = iRowCounter;
                    site.column = iColCounter;
                    var left = (iColCounter + 1) * 15;
                    var top = (iRowCounter + 1) * 15;
                    site.left = left;
                    site.top = top;
                    site.height = 15;
                    site.width = 15;
                    site.state = 0;
                    site.color = "rgb(0, 0, 0)"
                    a[iRowCounter][iColCounter] = site;
                }
            }
            return (a);
        } 

        function randomFromTo(from, to) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        }



        function grainAdded() {
            var colLocation = randomFromTo(16, 16); //tableSize - 1);
            var rowLocation = randomFromTo(16, 16);


            var retVal = this.siteList[rowLocation][colLocation].AddGrain();

            this.PaintCanvas();

        }

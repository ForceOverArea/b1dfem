const math = require('mathjs')
const three = require('three')

class Element1D {
    constructor(area, length, youngsMod) {
        this.k = area * youngsMod / length
        this.kMatrix = this.k * math.matrix([1, -1], [-1, 1])
    }
}

class Mesh {
    constructor(elements) {
        this.matrixSize = elements.length - 1 // this is the last index of the global n*n stiffness matrix
        this.K = math.zeros()
    
        this.K.subset(0, [0,1], [elements[0].k[0]])
        for (let i=1; i++; i<=elements.length-2) {
            let row = [
                elements[i-1].k[1][0],
                elements[i-1].k[1][1] + elements[i].k[0][0],
                elements[i].k[0],[1]
            ]
            this.K.subset(math.index(i, [i-1, i, i+1], row))
        }
        this.K.subset(math.index(-1, [-2, -1], elements[-1].k[1]))
    }

    solve = function(forces) {
        K = math.multiply(this.K, 0, 1, 1, 1) // apply zero deflection B.C. for element 1
        K_known = K.subset(math.index([1, -1], [1, -1]))
        K_unknown = K.subset(math.index(0))
        D = math.lusolve(K_known, forces)
        F_unknown = sum(math.multiply(K_unknown, D))
        let F = [].push(F_unknown, forces)
        let D = [0].push(D)

        return {'forces':F, 'displacements':D, 'stiffnesses':this.K}
    }
}

let myElems = [
    new Element1D(),
    new Element1D(),
    new Element1D()
]
let myMesh = new Mesh(myElems)
console.log(
    myMesh.solve([0,0,0])
)
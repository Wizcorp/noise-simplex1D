var RandomNumberGenerator = require('math-random').RandomNumberGenerator;

/**
 * @classdesc 1-dimensional Noise
 * @class
 *
 * @author Brice Chevalier
 *
 * @param {object} params
 * @param {number} params.octaves
 * @param {number} params.amplitude
 * @param {number} params.frequency
 * @param {number} params.persistance
 * @param {number} params.base
 */

var grad = [1, -1];

function Noise1D(params) {
	params = params || {};
	this.octaves = !params.octaves ? 1 : params.octaves;
	this.amplitude = !params.amplitude ? 1 : params.amplitude;
	this.frequency = !params.frequency ? 1 : params.frequency;
	this.persistance = !params.persistance ? 0.5 : Math.min(Math.max(params.persistance, 0), 1);

	// The scale is used to put the noise value in the interval [-amplitude / 2; amplitude / 2]
	this.scale = (this.persistance === 1) ? this.octaves * this.amplitude / 2 : (1 - this.persistance) / (1 - Math.pow(this.persistance, this.octaves)) * this.amplitude / 2;

	// The base is used to put the noise value in the interval [base; amplitude + base]
	this.base = (params.base || 0) + this.amplitude / 2;

	// initialize the permutation table
	this.seed(params.seed || 0);
}

/** Initialize noise's permutation table with provided seed
 *
 * @param {Number} seedNumber
 */
Noise1D.prototype.seed = function (seedNumber) {
	var i;

	// reset permutation table
	var perm = this.perm = [];
	for (i = 0; i < 256; i++) perm.push(i);

	// randomly permute elements in table
	var random = new RandomNumberGenerator(seedNumber);
	for (i = 0; i < 256; i++) {
		var index = ~~(256 * random.next());
		// permute the two indexes
		var v = perm[i];
		perm[i] = perm[index];
		perm[index] = v;
	}

	// concat the table with itself to duplicate the permutations
	perm = perm.concat(perm);
};

Noise1D.prototype.generateNoise = function (xin, yin) {
	var perm = this.perm;

	var i = (xin | xin) & 255;
	var gi0 = perm[i] & 1;
	var gi1 = perm[i + 1] & 1;

	var x1 = xin - (xin | xin);
	var x0 = 1.0 - x1;

	var n0 = x1 * (3 * x0 * x0 - 2 * x0 * x0 * x0) * grad[gi0];
	var n1 = -x0 * (3 * x1 * x1 - 2 * x1 * x1 * x1) * grad[gi1];

	// The result is scaled to return values in the interval [-1,1].
	return 2 * (n0 + n1);
};

// Complexity in O(o)
// with o the number of octaves
Noise1D.prototype.getNoise = function (x, y) {
	var noise = 0;
	var amp = 1.0;

	for (var o = 0; o < this.octaves; o += 1) {
		noise += this.generateNoise(x, y) * amp;
		x *= this.frequency;
		y *= this.frequency;
		amp *= this.persistance;
	}

	return noise * this.scale + this.base;
};

module.exports = Noise1D;

/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Knuth multiplicative hash constant (2^32 / golden ratio, nearest odd integer).
const KNUTH_MULTIPLIER = 2654435761;

/**
 * Maps `seed` to a well-distributed 32-bit unsigned integer using a Knuth multiplicative hash
 * followed by one round of xorshift32. Produces independent draws without fast-check overhead.
 *
 * Used as the shared primitive for `shouldGenerateEmpty`, `seededIndexInRange`, and
 * `deriveRetrySeed` — all of which need a single cheap, seeded, non-colliding hash draw.
 */
export const knuthHash = (seed: number): number => {
	let hash = (seed * KNUTH_MULTIPLIER + 1) >>> 0;
	hash ^= hash << 13;
	hash ^= hash >>> 17;
	hash ^= hash << 5;
	return hash >>> 0;
};

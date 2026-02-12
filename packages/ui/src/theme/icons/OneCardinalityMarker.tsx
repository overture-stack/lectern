/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/** @jsxImportSource @emotion/react */

export const ONE_CARDINALITY_MARKER_ID = 'one-cardinality-marker';

type OneCardinalityMarkerProps = {
	color?: string;
};

const OneCardinalityMarker = ({ color = '#374151' }: OneCardinalityMarkerProps) => {
	return (
		<svg style={{ position: 'absolute', top: 0, left: 0 }}>
			<defs>
				<marker
					id={ONE_CARDINALITY_MARKER_ID}
					markerWidth="20"
					markerHeight="20"
					viewBox="-10 -10 20 20"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
					refX="0"
					refY="0"
				>
					<line x1="0" y1="-6" x2="0" y2="6" stroke={color} strokeWidth="2" />
				</marker>
			</defs>
		</svg>
	);
};

export default OneCardinalityMarker;

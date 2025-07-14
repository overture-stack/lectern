/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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

const primary = {
	primary1: '#00A88F',
	primary2: '#00C4A7',
	primary3: '#00DDBE',
	primary4: '#40E6CF',
	primary5: '#99F1E5',
	primary6: '#CCF8F2',
	primary7: '#E5FBF8',
};

const secondary = {
	secondary1: '#0B75A2',
	secondary2: '#109ED9',
	secondary3: '#4BC6F0',
	secondary4: '#66CEF2',
	secondary5: '#AEE5F8',
	secondary6: '#D2F1FB',
	secondary7: '#EDF9FD',
};

const greyscale = {
	grey1: '#282A35',
	grey2: '#5E6068',
	grey3: '#AEAFB3',
	grey4: '#DFDFE1',
	grey5: '#F2F3F5',
	grey6: '#F2F5F8',
};

const accent = {
	accent1_1: '#003055',
	accent1_2: '#04518C',
	accent1_3: '#4F85AE',
	accent1_4: '#9BB9D1',
	accent1_5: '#C0D3E2',
	accent1_6: '#E5EDF3',
};

const accent2 = {
	accent2_1: '#9E005D',
	accent2_2: '#B74A89',
	accent2_3: '#C772A3',
	accent2_4: '#E2B7D0',
	accent2_5: '#EDD2E1',
	accent2_6: '#F7ECF3',
};

const accent3 = {
	accent3_1: '#CFD509',
	accent3_2: '#D9DE3A',
	accent3_3: '#E4E775',
	accent3_4: '#F0F2B0',
	accent3_5: '#F5F7CE',
	accent3_6: '#FBFBEB',
};

const gradient = {
	gradientStart: '#45A0D4',
	gradientEnd: '#6EC9D0',
};

export default {
	...primary,
	...secondary,
	...greyscale,
	...accent,
	...accent2,
	...accent3,
	...gradient,
};

/**
　出目が指定個数出る確率
@param {number} dice - ダイス数
@param {number} target - 指定個数
@param {number} range - 出目範囲、省略時1
@param {number} sided - ダイス面数、省略時10
@return {number} 確率
@customfunction
*/
function dicea(dice,target,range=1,sided=10){  
  if(range>sided) {return null}
  if(dice<=0)     {return 0}
  if(target>dice) {return 0}
  if(range<=0)    {return 0}
  if(sided<=0)    {return 0}
  const p = range/sided ;
  const q = (sided-range)/sided ;
  const pp = p**target;
  const qq = q**(dice-target);

  return cmb_(dice,target) * pp * qq; 
}

/**
　出目が指定個数以上出る確率
@param {number} dice - ダイス数
@param {number} target - 指定個数
@param {number} range - 出目範囲、省略時1
@param {number} sided  - ダイス面数、省略時10
@return {number} 確率
@customfunction
*/
function diceb(dice,target,range=1,sided =10){
  if(range>sided) {return null}
  if(target<=0)   {return 1}
  if(dice<=0)     {return 0}
  if(target>dice) {return 0}
  if(range<=0)    {return 0}
  if(sided<=0)    {return 0}
  let sum=0;
  for(let i=target;i<=dice;i++){
    sum += dicea(dice,i,range,sided );
  }
  return sum; 
}

/**
アクシデント遭遇率 ダイス数1以下は不可
アクシデント数×3＋探索対象ランク×2＞行動ダイスの1番目の出目＋2番目の出目＋天候補正値
@param {number} dice - ダイス数
@param {number} rank - 対象ランク
@param {number} weather - 天候補正
@param {number} first - 1番目のダイス出目(遭遇する敵テーブル)、省略or0指定で全アクシデント率
@return {number} 確率
@customfunction
*/
function erihosi_accident_enemy(dice,rank,weather,first=0) {
  if (dice<=1) { return null }
  if (first!=0) {
    return sub_accident_enemy_(dice,rank,weather,first);
  }
  let all  = 0;
  for(let i=1;i<=10;i++){
    all += sub_accident_enemy_(dice,rank,weather,i);
  }
  return all;
}

// アクシデント遭遇率計算のサブ関数
function sub_accident_enemy_(dice,rank,weather,first) {
  let sum = 0;
  for(let second=1;second<=10;second++){
    let threshold = first + second + weather - rank*2;
    let accident_need = Math.ceil((threshold+1)/3);
    if (first==1){accident_need--;}
    if (second==1){accident_need--;}
    sum += (accident_need<=0 ? 1 : diceb(dice-2,accident_need) )/100;
  }
  return sum;  
}


const area_table = ["草原","森林","湿原","水中"]
const monster_table = {
"草原":["リトルウィード","リキッドスライム","ウィングラビット","アントワーカー","プチスネイル","シルバーフライ","アントソルジャー","ワールウィンド","ステップイーグル","アントガーディアン","シャドウウルフ","ロックスネイル","バーニングレオ","キリングラビット","アントクイーン","ルフ","エメラルドヴァイパー","ハリケーン","ゲイルブレイド"],
"森林":["グラスイーター","レッドグレープ","ボアファイター","リビングストーン","ウィンドフラワー","ボアハンター","スカルスパイダー","リトルベア","フォレストタイガー","ボアシャーマン","マッドトレント","ベルセルクベア","メイズミスト","マンイーター","ボアロード","デススパイダー","エルク","ユグドラシルシード","アースドレイク"],
"湿原":["ジャイアントフロッグ","トーチフラワー","レッドリーチ","ミストピース","スケルトンソルジャー","スチールボックス","サファイアモルフォ","パンプキンヘッド","スケルトンチーフ","カースドヴァイパー","ブリンクミスト","スケルトンナイト","ダーティモスキート","パープルボックス","スケルトンジェネラル","ミスティックフィッシュ","ネクロマンサー","ファントムミスト","オブシディアンボックス"],
"水中":["コーラルフィッシュ","ニードルボール","レッドクラブ","ボーンフィッシュ","アクアシンガー","ポイズンジェリー","シャークパイレーツ","ストームウェーブ","イビルオクトパス","ライトニングジェリー","アダマントクラブ","シャークキャプテン","レッサーサーペント","サブマリンボックス","アドミラルシャーク","ゴーストシップ","アクアディーヴァ","クラーケン","アビスサーペント"],
}
/**
エリ星アクシデント遭遇敵
@param {number} area - 地形、[草原,森林,湿原,水中]の名称文字列、または[0,1,2,3]
@param {number} rank - 探索対象ランク
@param {number} first_dice - 1つ目のダイスの出目、0指定した場合候補を配列で返す
@param {boolean} ruin - 遺跡フラグ、省略時false
@return {Ofject} 遭遇する敵名称、または、配列
@customfunction
*/
function erihosi_surprised(area,rank,first_dice,ruin=false){

  const base = (rank-1+(ruin?1:0))*3;
  if (first_dice!=0){
    return sub_erihosi_surprised_(area,base,first_dice)
  }
  return [...Array(10).keys()].map(d => sub_erihosi_surprised_(area,base,d+1));
}

function sub_erihosi_surprised_(area,base,first_dice){
  if ([0,1,2,3].includes(area)) {area = area_table[area]}
  if (!area_table.includes(area)){return "noarea"}
  if (base+first_dice<0 || base+first_dice > monster_table[area].length) {return "nomonster"}
  return monster_table[area][base+first_dice-1]
}

/**
エリ星汎用判定成功率
@param {number} dice - ダイス数
@param {number} target - 目標値
@param {number} difficulty - 難易度
@return {number} 成功率
@customfunction
*/
function erihosi(dice,target,difficulty,bomb=false){
  let sum=0;
  const pat = hosipat_(dice,target);
  pat.forEach(function(arr_st_succ){
      let star = arr_st_succ[0];
      let success = arr_st_succ[1];
      let star_c = dicea(dice,star,1,10-(bomb?1:0));
      let succ_c = diceb(dice-star,success,10-difficulty,9-(bomb?1:0));
      sum += star_c * succ_c;
  })
  return sum; 
}

/**
エリ星調合成功率 
@param {number} dice - ダイス数、難易度超過による減衰は自動計算
@param {number} target - 目標値
@param {number} difficulty - 難易度、加工値・階級等による変動後の値を入力
@return {number} 成功率
@customfunction
*/
function erihosi_alchemy(dice,target,difficulty,bomb=false){
  return erihosi(actual_dice_(dice,difficulty), target, difficulty>10?10:difficulty,bomb)
}

/**
エリ星調合成功率 爆死は失敗扱い
@param {number} dice - ダイス数、難易度超過による減衰は自動計算
@param {number} target - 目標値
@param {number} difficulty - 難易度、加工値・階級等による変動後の値を入力
@param {number} resist - 爆破耐性
@param {boolean} danger - 危険鍋フラグ、省略時false
@return {number} 成功率
@customfunction
*/
function erihosi_alchemy_bomb(dice,target,difficulty,resist,danger=false){
  return  bomb_rate_(dice,resist,danger).reduce((sum,c,idx) => {
    return sum + c*erihosi_alchemy(dice-idx,target,difficulty,true);
  },0 );
}


/**
エリ星爆死率
@param {number} dice - ダイス数
@param {number} resist - 爆破耐性
@param {boolean} danger - 危険鍋フラグ、省略時false
@return {number} 爆死率
@customfunction
*/
function erihosi_bomb(dice,resist,danger=false){
  let accident_rate = bomb_rate_(dice,resist,danger)
  let live_c = 0;
  for (const accident in accident_rate){
    live_c += accident_rate[accident];
  }
  return 1-live_c;
}


/**********************
  以下、主にサブルーチン
**********************/

// 爆発ダメージテーブル
const bomb_table = [4,5,6,4,5,6,4,5,6,4,5,6,4,5,6,3,4,5,6,7,3,4,5,6,7,3,4,5,6,7,3,4,5,6,7,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8];

// 丸め桁数、アンダーフロー回避のため
const round=10**10; 


// アクシデント数毎の生存率の配列を返す,要素数はダイス数+1、キーをアクシデント数とする[確率,確率,...]
function bomb_rate_(dice,resist,danger){
  const damage_rate = damage_lt(bomb_table.slice(0,dice),resist,danger);
  let accident_sum = new Array(dice+1).fill(0);
  accident_sum[0]=1; // アクシデント0は必ず生存
  for (const accident_rate of damage_rate){
    const accident = accident_rate[0];
    const rate = accident_rate[1];
    accident_sum[accident] += rate;
  }
  return accident_sum.map((x, idx) => x==0?0:Math.round(x*round)/round*dicea(dice,idx));
}


// 配列中からmax以下(生存)になる全組み合わせを拾い上げ二次元配列で返す、値にはアクシデント個数と、各パターンの出現率をもたせる
// [[accident個数,出現率],…]
function damage_lt(damage_table,max,danger){
  const sorted_table = [...damage_table].sort((a, b) => a - b); //昇順ソート
  let damages = sub_damage_lt_([...sorted_table],max,[],danger);
  let result = []
  const damage_count = arr_count_(sorted_table);
  for(const damage of damages){
    let accident_count = arr_count_(damage);
    result.push([damage.length,cmb_rate_(damage_count,accident_count)]);
  }
  return result;
}

// 再起関数
function sub_damage_lt_(cnt_arr,max,cnt_cmb,danger){
  let result = [];
  let sum = 0;
  if (cnt_cmb.length>0){
    sum = cnt_cmb.reduce((a,b) => a+=b) + (danger?cnt_cmb.length*2:0);
  }
  
  let prev_val= 0;
  for (let i=0,len=cnt_arr.length;i<len;i++){
    let num = cnt_arr.shift();
    if (sum+num+(danger?2:0) > max){return result} // 最大値を超えるなら以降のどれを足しても無駄なのでその時点で返す
    if(num==prev_val){continue};prev_val = num;    // 前回の数字と同じなら計算済みなので飛ばす
    let new_cmb = [...cnt_cmb,num];                // 組み合わせに新しい数字を追加した配列
    result.push([...new_cmb]);                     // 組み合わせリストに記録
    result = result.concat( sub_damage_lt_([...cnt_arr],max,new_cmb,danger) ); // 今の組み合わせに新しい数字を足せるか再帰的に処理
  }
  return result;
}


// 調合難易度によるダイス補正
function actual_dice_(dice,difficulty){
  return difficulty>10 ? dice-(difficulty-10)*10 : dice;
}


// 目標値によって必要な星と星以外の成功数の組み合わせパターンを返す
//　戻り値はダイス数分の配列 [[星個数,通常成功個数],[星個数,通常成功個数],...]
function hosipat_(dice,target){
  let pattern = [];
  let not_star = target;
  for (let i=0;i<=dice;i++) {
    pattern.push([i,not_star<0 ? 0 : not_star]);
    not_star-=2;
  }
  return pattern;
}


// 組み合わせ出現率計算
function cmb_rate_(arr_all,arr_target){
  const arr_all_sum = arr_all.reduce((a,b) => a+=b);
  const arr_target_sum = arr_target.reduce((a,b) => a+=b)
  if (arr_all_sum==arr_target_sum){return 1}
  const all_case = cmb_(arr_all_sum,arr_target_sum);
  let rate = 1;
   for (let i=0,len=arr_target.length;i<len;i++) {
     rate *= cmb_(arr_all[i],arr_target[i]);
   }
   rate /= all_case;
   return rate;
}


// 配列の要素の個数を配列にする
// 配列のキーが要素の値（基本2～8までなので、0と１は常に0になる想定）
function arr_count_(damage_arr){
  let result = new Array(Math.max.apply(null, damage_arr)+1).fill(0);
  for(const damage of damage_arr){
    result[damage]++;
  }
  return result;
}


// 組み合わせ関数、combin関数と同等 aCb
function cmb_(a,b) {
  let com = 1;
  for(let i=0;i<b;i++){
    com=com*(a-i)/(i+1)
  }
  return com;
}

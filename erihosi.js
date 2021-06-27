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
  if(dice==0&&target==0){return 1}
  if(dice<=0)     {return 0}
  if(target>dice) {return 0}
  if(range<=0)    {return 0}
  if(sided<=0)    {return 0}
  const p = range/sided ;
  const q = (sided-range)/sided ;
  const pp = p**target;
  const qq = q**(dice-target);

  return small_round(cmb_(dice,target) * pp * qq); 
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
  pat.forEach(function(success,star){
      if (success+star>dice){return}  // 星＋通常成功がダイス数を超える（実現不可能）場合はスキップ
      let star_c = dicea(dice,star,1,10-(bomb?1:0));
      let succ_c = diceb(dice-star,success,10-difficulty,9-(bomb?1:0));
      sum += star_c * succ_c;
  })
  return sum; 
}

/**
エリ星判定ダイス数
@param {number} param - 判定の基本ステータス値
@param {number} item_magic - 魔力仕様時の追加ダイス
@param {number} optional - その他ダイス補正、省略時0

@return {object} ダイス数の配列[短縮,短縮魔力,通常,通常魔力,延長,延長魔力]
@customfunction
*/
function erihosi_dice(param,magic_bonus,optional=0){
  return [
    Math.floor((param+optional)/2),
    Math.floor((param+magic_bonus+optional)/2),
    param+optional,
    param+magic_bonus+optional,
    param*2+optional,
    param*2+magic_bonus+optional
  ]
}

/**
エリ星採取成功率
@param {object} physical - 体力
@param {object} item_magic - 道具魔力
@param {number} rank - 探索対象ランク
@param {number} difficulty - 難易度
@param {boolean} area - 道具適正と地形の一致
@param {boolean} element - 道具属性と採取対象属性の一致
@param {number} bonus - 階級補正、学科生:0,学士・公式:1,修士:2

@return {object} 成功率の二次元配列、1次キー(行方向)が判定種別、2次キー(列方向)がレア種別
@customfunction
*/
function erihosi_gather_array (physical,item_magic,rank,difficulty,area,element,bonus){
  const dice = erihosi_dice(physical,item_magic)
  return dice.map((die,idx) => {
    let sum = new Array(3).fill(0);
    const cb = [0,2].includes(idx)?0:bonus
    const target = rank*2-cb
    const rare = [0,2,4].map(x=>erihosi_rare_target(rank,x,area,element,cb));

    for (let star=0;star<=die;star++){ //星の数0～ダイス
      for (let success=Math.max(target-star*2,0);success<=die-star;success++){//成功の数、0or通常成功の最低必要数～ダイス-星
        for (let accident=0;accident<=die-star-success;accident++){//アクシデントの数、0～ダイス-星-成功
          const chance = dicea(die                 ,star      ,1             ,10 ) * // 星がstar個出る率
                         dicea(die-star            ,accident  ,1             ,9  ) * // アクシデントがaccident個出る率
                         dicea(die-star-accident   ,success   ,10-difficulty ,8  )   // 成功がsuccess個出る率

          const achieved = star*2+success+accident
          if (achieved>=rare[2]){
            sum[2] += chance;
          }
          else if (achieved>=rare[1]){
            sum[1] += chance;
          }
          else {
            sum[0] += chance
          }
        }
      }
    }
    return sum; 
  })
}

/**
 エリ星レア採取目標値
 エリ星採取成功率
@param {number} rank - 探索対象ランク
@param {number} rare - レア採取、[0,2,4]のいずれかを指定、省略で0（通常品）
@param {boolean} area - 道具適正と地形の一致
@param {boolean} element - 道具属性と採取対象属性の一致
@param {number} bonus - 階級補正、魔力・延長どちらもしない場合は0

@return {number} 目標値（レア品の場合達成値＋アクシデント）
@customfunction
 */
function erihosi_rare_target (rank,rare,area,element,bonus) {
  if (rare==0){return rank*2  - bonus}
  else if (rare==2) {return rank+7 - (area?2:0) - (element?1:0) - bonus}
  else if (rare==4) {return rank+23 - (area?4:0) - (element?2:0) - bonus}
  else {return -99} // エラー

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
エリ星調合成功率 爆死は失敗扱い
@param {number} dice - ダイス数、難易度超過による減衰は自動計算
@param {number} difficulty - 目標1の調合時の難易度
@param {number} resist - 爆破耐性
@param {number} klass - 階級　学科生:0、学士・公式:1、修士:2
@param {boolean} danger - 危険鍋フラグ、省略時false
@return {number} 調合目標値[1-20]をキーとした20要素の成功率の配列
@customfunction
*/
function erihosi_alchemy_bomb_array(dice,difficulty,resist,klass,danger){
  return [...Array(20).keys()].map(x => {
    const target = x+1;
    const act_diff = difficulty + (target>(10+klass)?target-(10+klass):0)
    return erihosi_alchemy_bomb(dice,target,act_diff,resist,danger);
  })    
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

/**
エリ星魔法攻撃調査（実測用）
@param {number} dice -ダイス数
@param {number} trial - 試行回数、省略時1000
@param {number} max - 上限値、これ以上の値はmaxとして扱う、省略時1000
@param {number} group - 出目結果をまとめるの範囲、0~group、group~group*2...をひとまとめとする、0指定は不可、省略時5
@param {boolean} battle - 戦闘ダイス化フラグ、出目1は-3，出目10は15として扱う、省略時true

@return {object} 実測結果の出目合計出現率を配列で返す、要素数はmin(max,dice*10or15)/group
@customfunction
*/
function erihosi_dice_sum_trial(dice,trial=1000,max=1000,group=5,battle=true){
  let result = new Array(Math.floor((Math.min(max,dice*(battle?15:10))/group))+1).fill(0);
    for (let i=0;i<=trial;i++){
      let total_dam = 0;
      for (let j=1;j<=dice;j++){
        const deme = Math.floor( Math.random() * 11 );
        total_dam += battle?(deme==10?15 : deme==1?-3 : deme) : deme;
    }
    total_dam = total_dam>=max?max : total_dam<0?0 : total_dam
    result[Math.floor(total_dam/group)] ++;
  }
  return result.map(x=>x/trial);
}

/**
エリ星魔法攻撃調査（実測用）
@param {number} dice -ダイス数
@param {number} trial - 試行回数、省略時1000
@param {number} max - 上限値、これ以上の値はmaxとして扱う、省略時1000
@param {boolean} battle - 戦闘ダイス化フラグ、出目1は-3，出目10は15として扱う、省略時true
@param {number} group - 出目結果を丸める範囲、指定の単位で切り捨てる、省略時1

@return {object} 実測結果の出目合計を配列で返す、要素数はtrial/group
@customfunction
*/
function erihosi_dice_trial(dice=20,trial=1000,max=1000,battle=true,group=1){
  let result = [];
    for (let i=0;i<=trial;i++){
      let total_dam = 0;
      for (let j=1;j<=dice;j++){
        const deme = Math.floor( Math.random() * 11 );
        total_dam += battle?(deme==10?15 : deme==1?-3 : deme) : deme;
    }
    total_dam = total_dam>=max?max : total_dam<0?0 : total_dam
    total_dam = group>1?Math.floor(total_dam/group)*group : total_dam
    result.push(total_dam);
  }
  return result;
}

/**
エリ星魔法攻撃調査（実測用）
@param {number} min_dice -最小ダイス数
@param {number} max_dice -最大ダイス数
@param {number} trial - 試行回数、省略時1000
@param {number} max - 上限値、これ以上の値はmaxとして扱う、省略時1000
@param {boolean} battle - 戦闘ダイス化フラグ、出目1は-3，出目10は15として扱う、省略時true
@param {number} group - 出目結果を丸める範囲、指定の単位で切り捨てる、省略時1

@return {object} 実測結果の出目合計を配列で返す、要素数は[max_dice-min_dice][trial/group]
@customfunction
*/
function erihosi_dice_sum_trial_arr(min_dice=1,max_dice=25,trial=1000,max=1000,battle=true,group=1){
  let result = [];  
  for (let i = min_dice;i<=max_dice;i++){
    result.push(erihosi_dice_sum_trial(i,trial,max,battle,group))
  }
  return transpose(result)
}



/**
エリ星魔法攻撃調査（実測用）
@param {number} min_dice -最小ダイス数
@param {number} max_dice -最大ダイス数
@param {number} trial - 試行回数、省略時1000
@param {number} max - 上限値、これ以上の値はmaxとして扱う、省略時1000
@param {boolean} battle - 戦闘ダイス化フラグ、出目1は-3，出目10は15として扱う、省略時true

@return {object} 実測結果の出目合計の平均値・中央値・最頻値値を配列で返す、要素数は[3][max_dice-min_dice]
@customfunction
*/
function erihosi_dice_statistics(min_dice=1,max_dice=25,trial=1000,max=1000,battle=true){
  let result = [new Array(max_dice-min_dice+1),new Array(max_dice-min_dice+1),new Array(max_dice-min_dice+1)]
  for (let i = min_dice;i<=max_dice;i++){
    const dice_arr = erihosi_dice_trial(i,trial,max,battle);
    result[0][i-min_dice] = average(dice_arr);
    result[1][i-min_dice] = median(dice_arr);
    result[2][i-min_dice] = mode(dice_arr);
  }
  return result;
}

/**********************
  以下、主にサブルーチン
**********************/

// 二次元配列の転置
const transpose = a => a[a.length-1].map((_, c) => a.map(r => r[c]));

// 平均
const average = a => a.reduce((sum,cur) => sum + cur)/a.length;
// 中央
const median = a => {
  const b = [...a].sort((x,y)=>x-y);
  const half = Math.floor(b.length/2);
  return b.length%2==1?b[half] : (b[half-1]+b[half])/2
}
// 最頻
const mode = a => {
  let mode_val = null;
  let count = {};
  for (const val of a) {
    if (count[val]) {
      count[val] ++;
    } else {
      count[val] = 1;
    }
  }
  let max = 0;
  for (const key in count) {
    if (count[key] > max) {
      max = count[key];
      mode_val = key;
    }
  }
  return mode_val;
}


// 爆発ダメージテーブル
const bomb_table = [4,5,6,4,5,6,4,5,6,4,5,6,4,5,6,3,4,5,6,7,3,4,5,6,7,3,4,5,6,7,3,4,5,6,7,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8,2,3,4,5,6,7,8];

// 丸め関数、オーバーフロー回避のため
const digit=10**10; 
function small_round(x){
  return Math.round(x*digit)/digit
}


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
  return accident_sum.map((x, idx) => x==0?0:small_round(x)*dicea(dice,idx));
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
//　戻り値はキーを星個数としたダイス数+1の配列 [通常成功個,通常成功個],...]
function hosipat_(dice,target){
  if(dice<=0){return []}
  return [...Array(dice+1).keys()].map(star => Math.max(target-star*2,0))
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


// 階乗関数
function factorialize(num) {
  if (num === 0) { return 1; }
  return  [...Array(num).keys()].reduce((a,b) => {return a*=b+1},1)
}

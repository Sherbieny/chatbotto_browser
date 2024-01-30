const TOKENIZED_PROMPTS_DB_KEY = 'tokenizedChatbotPrompts';
/**
* RakutenMA Tokenizer response PoS tags
* @see
https://github.com/rakuten-nlp/rakutenma/blob/master/README.md#pos-tag-list-in-japanese-and-correspondence-to-bccwj-tags
*/
const weightMap = {
    "A-c": 1, //形容詞-一般 Adjective-Common
    "A-dp": 0, //形容詞-非自立可能 Adjective-Dependent
    "C": 0, //接続詞 Conjunction
    "D": 0, //代名詞 Pronoun
    "E": 2, //英単語 English word
    "F": 0, //副詞 Adverb
    "I-c": 0, //感動詞-一般 Interjection-Common
    "J-c": 0, //形状詞-一般 Adjectival Noun-Common
    "J-tari": 0, //形状詞-タリ Adjectival Noun-Tari
    "J-xs": 0, //形状詞-助動詞語幹 Adjectival Noun-AuxVerb stem
    "M-aa": 0, //補助記号-AA Auxiliary sign-AA
    "M-c": 0, //補助記号-一般 Auxiliary sign-Common
    "M-cp": 0, //補助記号-括弧閉 Auxiliary sign-Open Parenthesis
    "M-op": 0, //補助記号-括弧開 Auxiliary sign-Close Parenthesis
    "M-p": 0, //補助記号-句点 Auxiliary sign-Period
    "N-n": 3, //名詞-名詞的 Noun-Noun
    "N-nc": 3, //名詞-普通名詞 Noun-Common Noun
    "N-pn": 3, //名詞-固有名詞 Noun-Proper Noun
    "N-xs": 0, //名詞-助動詞語幹 Noun-AuxVerb stem
    "O": 0, //その他 Others
    "P": 0, //接頭辞 Prefix
    "P-fj": 0, //助詞-副助詞 Particle-Adverbial
    "P-jj": 0, //助詞-準体助詞 Particle-Phrasal
    "P-k": 0, //助詞-格助詞 Particle-Case Marking
    "P-rj": 0, //助詞-係助詞 Particle-Binding
    "P-sj": 0, //助詞-接続助詞 Particle-Conjunctive
    "Q-a": 0, //接尾辞-形容詞的 Suffix-Adjective
    "Q-j": 0, //接尾辞-形状詞的 Suffix-Adjectival Noun
    "Q-n": 0, //接尾辞-名詞的 Suffix-Noun
    "Q-v": 0, //接尾辞-動詞的 Suffix-Verb
    "R": 0, //連体詞 Adnominal adjective
    "S-c": 0, //記号-一般 Sign-Common
    "S-l": 0, //記号-文字 Sign-Letter
    "U": 0, //URL
    "V-c": 2, //動詞-一般 Verb-Common
    "V-dp": 0, //動詞-非自立可能 Verb-Dependent
    "W": 0, //空白 Whitespace
    "X": 0 //助動詞 AuxVerb
};

class Tokenizer {
    constructor(chatbotDBInstance) {
        this.rakutenma = null;
        this.weightMap = null;
        this.tokenizedPrompts = null;
        this.db = chatbotDBInstance;
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('js/lib/rakutenma/model_ja.min.json');
                if (!response.ok) {
                    reject(new Error(`HTTP error ${response.status}`));
                    return;
                }
                const model_ja = await response.json();
                this.rakutenma = new RakutenMA(model_ja);
                this.rakutenma.featset = RakutenMA.default_featset_ja;
                this.rakutenma.hash_func = RakutenMA.create_hash_func(15);
                this.weightMap = weightMap
                await this.updateWeights();
                await this.tokenizeChatbotPrompts();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async updateWeights() {
        // Get the latest weights from IndexedDB
        const weights = await this.db.getChatbotData('weights');
        if (weights) {
            //take key and value from weights array of objects
            const weightMap = weights.reduce((map, obj) => {
                map[obj.key] = obj.value;
                return map;
            }, {});
            this.weightMap = weightMap;
        }
    }

    getWeightsMap() {
        return this.weightMap;
    }

    async tokenizeChatbotPrompts() {
        if (!this.rakutenma) {
            await this.init();
        }

        // check if tokenized questions are already in IndexedDB
        let tokenizedChatbotPrompts;
        try {
            tokenizedChatbotPrompts = await this.db.getChatbotData(TOKENIZED_PROMPTS_DB_KEY);
            if (tokenizedChatbotPrompts) {
                this.tokenizedPrompts = tokenizedChatbotPrompts;
                return;
            }
        } catch (e) {
            console.log(e);
        }


        const prompts = await this.db.getChatbotData('qa').then(data => {
            return data.map(item => item.prompt);
        });
        tokenizedChatbotPrompts = prompts.map(prompt => {
            const tokens = this.tokenizeString(prompt);
            return tokens;
        });

        // Save tokenized questions to IndexedDB
        await this.db.saveTokenizedChatbotPromptsData(tokenizedChatbotPrompts);

        this.tokenizedPrompts = tokenizedChatbotPrompts;
    }

    async getTokenizedPrompts() {
        if (!this.tokenizedPrompts) {
            await this.tokenizeChatbotPrompts();
        }

        return this.tokenizedPrompts;
    }

    tokenizeString(input) {
        return this.rakutenma.tokenize(
            HanZenKaku.hs2fs(HanZenKaku.hw2fw(HanZenKaku.h2z(input)))
        );
    }
}
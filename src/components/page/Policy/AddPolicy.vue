<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 表单
                </el-breadcrumb-item>
                <el-breadcrumb-item>添加策略</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="主体">
                        <el-input v-model="form.sub"></el-input>
                    </el-form-item>
                    <el-form-item label="资源">
                        <el-input v-model="form.obj"></el-input>
                    </el-form-item>
                    <el-form-item label="动作">
                        <el-select v-model="form.act" placeholder="策略动作" class="handle-select mr10">
                        <el-option v-for="item in enumValueList" :key="item" :label="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">表单提交</el-button>
                        <el-button type="danger" @click="onClear">清空</el-button>
                        <el-button>取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'baseform',
    data() {
        return {
            form: {
                sub: '',
                obj: '',
                act: ''
            },
            enumValueList: []
        };
    },
    created() {
        this.getEnumData();
    },
    methods: {
        onSubmit() {
            console.log("onSubmit")
            this.$axios.post('api/policy/create', {
                policy_sub: this.form.sub,
                policy_obj: this.form.obj,
                policy_act: this.form.act
            })
            .then( (res) => {
                this.$message.success('提交成功！');    
            })
        },
        onClear() {
            this.form = {};
        },
        // 获取策略动作数据
        getEnumData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'policy_act'
                })
                .then(res => {
                    // console.log('resdata: ', res.data);
                    this.parseEnumData(res.data.enum_value);
                });
        },
        // 处理策略动作数据
        parseEnumData(data) {
            var str = data.split('##');
            for (var i = 0; i < str.length; i++) {
                if (str[i] == '' || typeof str[i] == 'undefined') {
                    str.splice(i, 1);
                    i = i - 1;
                }
            }
            this.enumValueList = str;
        }
    }
};
</script>
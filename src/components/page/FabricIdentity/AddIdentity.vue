<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 表单
                </el-breadcrumb-item>
                <el-breadcrumb-item>添加身份</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="身份名称">
                    <el-input v-model="form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="身份密码">
                        <el-input v-model="form.secret"></el-input>
                    </el-form-item>
                    <el-form-item label="身份类型"> 
                        <el-radio-group v-model="form.type">
                            <el-radio label="client"></el-radio>
                            <el-radio label="peer"></el-radio>
                            <el-radio label="order"></el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="身份从属">
                        <el-input v-model="form.affiliation"></el-input>
                    </el-form-item>
                    <el-form-item label="身份属性">
                        <el-input v-model="form.attrs"></el-input>
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
                name: '',
                secret: '',
                type: '',
                affiliation: '',
                attrs: '',
            },
            nameAndRolesList: [],
        };
    },
    created() {
        this.getEnumData();
    },
    methods: {
        onSubmit() {
            console.log("onSubmit")
            this.$axios.post('api/identity/create', {
                identity_name: this.form.name,
                identity_secret: this.form.secret,
                identity_type: this.form.type,
                identity_affiliation: this.form.affiliation,
                identity_attrs: this.form.attrs,
            })
            .then( (res) => {
                this.$message.success('提交成功！');    
            })
        },
        onClear() {
            this.form = {};
        },
        // 获取所有用户名和角色
        getNameAndRolesData() {
            this.$axios
                .post('api/user/listNameAndRole', {
                })
                .then(res => {
                    console.log('resdata: ', res.data);
                    this.nameAndRolesList = res.data.list;
                });
        },
        // 获取身份动作数据
        getEnumData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'identity_act'
                })
                .then(res => {
                    // console.log('resdata: ', res.data);
                    this.parseEnumData(res.data.enum_value);
                });
        },
        // 处理身份动作数据
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
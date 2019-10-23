<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 表单
                </el-breadcrumb-item>
                <el-breadcrumb-item>添加用户</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="form.user_name"></el-input>
                    </el-form-item>
                    <el-form-item label="身份">
                        <el-select v-model="form.user_role" placeholder="用户身份" class="handle-select mr10">
                            <el-option v-for="item in enumValueList" :key="item" :label="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="部门">
                        <el-input v-model="form.user_department"></el-input>
                    </el-form-item>
                    <el-form-item label="地址">
                        <el-input v-model="form.user_address"></el-input>
                    </el-form-item>
                    <el-form-item label="电子邮箱">
                        <el-input v-model="form.user_email"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话">
                        <el-input v-model="form.user_phone"></el-input>
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
                type: ''
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
            this.$axios.post('api/user/create', {
                user_name: this.form.user_name,
                user_role: this.form.user_role,
                user_department: this.form.user_department,
                user_address: this.form.user_address,
                user_email: this.form.user_email,
                user_phone: this.form.user_phone,
            })
            .then( (res) => {
                this.$message.success('提交成功！');    
            })
        },
        onClear() {
            this.form = {};
        },
        // 获取用户角色数据
        getEnumData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'user_role'
                })
                .then(res => {
                    // console.log('resdata: ', res.data);
                    this.parseEnumData(res.data.enum_value);
                });
        },
        // 处理用户角色数据
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
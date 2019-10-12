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
                        <el-radio-group v-model="form.user_role">
                            <el-radio label="管理员"></el-radio>
                            <el-radio label="员工"></el-radio>
                            <el-radio label="经理"></el-radio>
                        </el-radio-group>
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
            }
        };
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
        }
    }
};
</script>
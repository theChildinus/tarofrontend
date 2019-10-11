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
                        <el-radio-group v-model="form.act">
                            <el-radio label="read"></el-radio>
                            <el-radio label="write"></el-radio>
                            <el-radio label="exec"></el-radio>
                        </el-radio-group>
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
                sub: '',
                obj: '',
                act: ''
            }
        };
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
        }
    }
};
</script>
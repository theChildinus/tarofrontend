<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 表单
                </el-breadcrumb-item>
                <el-breadcrumb-item>添加资源</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="资源名称">
                        <el-input v-model="form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="资源类型">
                        <el-radio-group v-model="form.type">
                            <el-radio label="报表"></el-radio>
                            <el-radio label="工具"></el-radio>
                            <el-radio label="态势图"></el-radio>
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
                name: '',
                type: ''
            }
        };
    },
    methods: {
        onSubmit() {
            console.log("onSubmit")
            var type;
            switch (this.form.type) {
                case "报表": type = 0; break;
                case "工具": type = 1; break;
                case "态势图": type = 2; break;
                default: type = -1;
            }
            this.$axios.post('api/resource/create', {
                resource_name: this.form.name,
                resource_type: type
            })
            .then( (res) => {
                console.log(res.data)
                
            })
            this.$message.success('提交成功！');
        }
    }
};
</script>
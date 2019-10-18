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
                        <el-select
                            v-model="form.type"
                            placeholder="资源类型"
                            class="handle-select mr10"
                        >
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
            console.log('onSubmit');
            this.$axios
                .post('api/resource/create', {
                    resource_name: this.form.name,
                    resource_type: this.form.type
                })
                .then(res => {
                    this.$message.success('提交成功！');
                });
        },
        onClear() {
            this.form = {};
        },
        // 获取资源类型数据
        getEnumData() {
            this.$axios
                .post('api/enum/getValue', {
                    enum_key: 'resource_type'
                })
                .then(res => {
                    // console.log('resdata: ', res.data);
                    this.parseEnumData(res.data.enum_value);
                });
        },
        // 处理资源类型数据
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